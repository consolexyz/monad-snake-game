"use client";

import { useEffect, useState } from "react";
import { SnakeGame } from "./SnakeGame";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function SnakePage() {
    const [currentScore, setCurrentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [apiStatus, setApiStatus] = useState<{ message: string, isError: boolean } | null>(null);
    const { address } = useAccount();

    const handleScoreUpdate = async (newScore: number) => {
        setCurrentScore(newScore);

        // Send transaction via relayer for each food eaten
        if (address) {
            console.log("🎮 Sending score update to blockchain via relayer...");
            console.log("📊 Score:", newScore);
            console.log("👤 Player:", address);

            try {
                const response = await fetch("/api/relayer/increment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        address: address,
                        score: newScore
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.warn("❌ Relayer response not OK:", response.status);
                    console.warn("Error details:", data);
                } else {
                    console.log("✅ Score submitted to blockchain via relayer:", newScore);
                    if (data.transactionHash) {
                        console.log("🔗 Transaction hash:", data.transactionHash);
                        console.log("🎯 Transaction successful! Score updated on blockchain");
                    }
                }
            } catch (error) {
                console.error("❌ Failed to send score update via relayer:", error);
            }
        }
    };

    const handleGameOver = async (finalScore: number) => {
        setGameOver(true);
        setCurrentScore(finalScore);

        if (address && finalScore > 0) {
            setApiStatus({ message: "Saving your score...", isError: false });

            // Save final score to the database only
            try {
                console.log(`Saving final score to database: address=${address}, score=${finalScore}`);

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
                    console.log("✅ Score saved successfully!");
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
                            ? "New high score saved!"
                            : "Score recorded (not a new high score)",
                        isError: false
                    });
                } else {
                    console.error("❌ Failed to save score:", data.error);

                    // Update the save status element
                    const saveStatusElement = document.getElementById('saveStatus');
                    if (saveStatusElement) {
                        saveStatusElement.innerHTML = `
                            <div class="badge badge-error gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Error saving score
                            </div>
                        `;
                    }

                    setApiStatus({
                        message: `Error saving score: ${data.error}`,
                        isError: true
                    });
                }
            } catch (error) {
                console.error("Error saving score:", error);

                // Update the save status element
                const saveStatusElement = document.getElementById('saveStatus');
                if (saveStatusElement) {
                    saveStatusElement.innerHTML = `
                        <div class="badge badge-error gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            Failed to save score
                        </div>
                    `;
                }

                setApiStatus({
                    message: "Failed to save score",
                    isError: true
                });
            }
        } else if (!address) {
            setApiStatus({
                message: "Connect your wallet to save scores",
                isError: true
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
                                <span className="font-bold">📝 Status:</span>
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