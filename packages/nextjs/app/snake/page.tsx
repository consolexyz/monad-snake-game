"use client";

import { useEffect, useState } from "react";
import { SnakeGame } from "./SnakeGame";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function SnakePage() {
    const [currentScore, setCurrentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [apiStatus, setApiStatus] = useState<{ message: string, isError: boolean, type: 'blockchain' | 'database' | 'general' } | null>(null);
    const { address } = useAccount();

    const { data: snakeGameContract } = useScaffoldContract({
        contractName: "SnakeGame",
    });

    const { writeContractAsync } = useScaffoldWriteContract({
        contractName: "SnakeGame",
    });

    const handleScoreUpdate = async (newScore: number) => {
        setCurrentScore(newScore);

        // Send transaction via relayer for each food eaten
        try {
            const response = await fetch("/api/relayer/increment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ score: newScore }),
            });

            if (!response.ok) {
                console.warn("Relayer response not OK:", response.status);
            }
        } catch (error) {
            console.error("Failed to send score update:", error);
        }
    };

    const handleGameOver = async (finalScore: number) => {
        setGameOver(true);
        setCurrentScore(finalScore);

        if (address && finalScore > 0) {
            setApiStatus({ message: "Saving your score...", isError: false, type: 'general' });

            // First try to save to the blockchain
            let blockchainSuccess = false;
            try {
                await writeContractAsync({
                    functionName: "submitScore",
                    args: [BigInt(finalScore)],
                });
                console.log("Score submitted to blockchain successfully");
                blockchainSuccess = true;
                setApiStatus({ message: "Score saved to blockchain! Saving to database...", isError: false, type: 'blockchain' });
            } catch (error) {
                console.error("Error submitting score to blockchain:", error);
                setApiStatus({ message: "Failed to save score to blockchain, trying database...", isError: true, type: 'blockchain' });
            }

            // Then try to save to the database
            try {
                console.log(`Attempting to save score to database: address=${address}, score=${finalScore}`);

                const response = await fetch('/api/scores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        address: address,
                        score: finalScore,
                    }),
                });

                console.log(`Database API response status: ${response.status}`);

                const data = await response.json();
                console.log("API response data:", data);

                if (data.success) {
                    console.log("✅ POST REQUEST SUCCESSFUL!");
                    console.log(`Score saved with ID: ${data.id}`);

                    // Update the save status element
                    const saveStatusElement = document.getElementById('saveStatus');
                    if (saveStatusElement) {
                        if (data.isNewHighScore) {
                            saveStatusElement.innerHTML = `
                                <div class="badge badge-success gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    New high score saved!
                                </div>
                            `;
                        } else {
                            saveStatusElement.innerHTML = `
                                <div class="badge badge-info gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Score recorded (not a new high score)
                                </div>
                            `;
                        }
                    }

                    setApiStatus({
                        message: data.isNewHighScore
                            ? (blockchainSuccess ? "New high score saved to blockchain and database!" : "New high score saved to database!")
                            : (blockchainSuccess ? "Score recorded (not a new high score)" : "Score recorded (not a new high score)"),
                        isError: false,
                        type: 'database'
                    });
                } else {
                    console.error("❌ POST REQUEST FAILED:", data.error);

                    // Update the save status element
                    const saveStatusElement = document.getElementById('saveStatus');
                    if (saveStatusElement) {
                        saveStatusElement.innerHTML = `
                            <div class="badge badge-error gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Database error
                            </div>
                        `;
                    }

                    setApiStatus({
                        message: blockchainSuccess
                            ? `Score saved to blockchain but database error: ${data.error}`
                            : `Error saving score: ${data.error}`,
                        isError: true,
                        type: 'database'
                    });
                }
            } catch (dbError) {
                console.error("Error saving score to database:", dbError);

                // Update the save status element
                const saveStatusElement = document.getElementById('saveStatus');
                if (saveStatusElement) {
                    saveStatusElement.innerHTML = `
                        <div class="badge badge-error gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            Database connection failed
                        </div>
                    `;
                }

                setApiStatus({
                    message: blockchainSuccess
                        ? "Score saved to blockchain but failed to save to database"
                        : "Failed to save score to database",
                    isError: true,
                    type: 'database'
                });
            }
        } else if (!address) {
            setApiStatus({
                message: "Connect your wallet to save scores",
                isError: true,
                type: 'general'
            });
        }
    };

    const handleRestart = () => {
        setGameOver(false);
        setCurrentScore(0);
        setApiStatus(null);

        // Clear the save status
        const saveStatusElement = document.getElementById('saveStatus');
        if (saveStatusElement) {
            saveStatusElement.innerHTML = '';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
            <div className="text-center w-full mb-8">
                <h1 className="text-4xl font-bold mb-4">Snake Game</h1>
                <p className="text-xl mb-2">Score: {currentScore}</p>
            </div>

            <div className="mb-8">
                <SnakeGame
                    onScoreUpdate={handleScoreUpdate}
                    onGameOver={handleGameOver}
                    gameOver={gameOver}
                />
            </div>

            {gameOver && (
                <div className="flex flex-col items-center gap-4">
                    {apiStatus && (
                        <div className={`alert ${apiStatus.isError ? 'alert-warning' : 'alert-success'} mb-4 max-w-md`}>
                            <div>
                                <span className="font-bold">{apiStatus.type === 'blockchain' ? '🔗 Blockchain:' : apiStatus.type === 'database' ? '💾 Database:' : '📝 Status:'}</span>
                                <span className="ml-2">{apiStatus.message}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center mb-4">
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title">Final Score</div>
                                <div className="stat-value">{currentScore}</div>
                            </div>
                        </div>

                        <div id="saveStatus" className="mt-2 text-sm">
                            {/* This will be updated by JavaScript */}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="btn btn-primary"
                            onClick={handleRestart}
                        >
                            Play Again
                        </button>
                        <Link href="/leaderboard" className="btn btn-secondary">
                            Check Leaderboard
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
} 