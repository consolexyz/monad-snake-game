"use client";

import { useEffect, useState } from "react";
import { SnakeGame } from "./SnakeGame";
import Link from "next/link";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export default function SnakePage() {
    const [currentScore, setCurrentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
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
            try {
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

                const data = await response.json();

                if (data.success) {
                    // Update the save status element
                    const saveStatusElement = document.getElementById('saveStatus');
                    if (saveStatusElement) {
                        if (data.isNewHighScore) {
                            saveStatusElement.innerHTML = `
                                <div class="badge badge-success gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    New high score!
                                </div>
                            `;
                        } else {
                            saveStatusElement.innerHTML = `
                                <div class="badge badge-info gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Score recorded
                                </div>
                            `;
                        }
                    }
                }
            } catch (error) {
                // Silently handle errors without showing them to the user
                console.error("Error saving score:", error);
            }
        } else if (!address) {
            // Update the save status element to indicate wallet connection needed
            const saveStatusElement = document.getElementById('saveStatus');
            if (saveStatusElement) {
                saveStatusElement.innerHTML = `
                    <div class="badge badge-warning gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Connect wallet to save scores
                    </div>
                `;
            }
        }
    };

    const handleRestart = () => {
        setGameOver(false);
        setCurrentScore(0);

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
                {!address ? (
                    <div className="alert alert-warning max-w-md mx-auto">
                        <span>Please connect your wallet to play the game and save your scores!</span>
                    </div>
                ) : (
                    <p className="text-xl mb-2">Score: {currentScore}</p>
                )}
            </div>

            <div className="mb-8">
                {address ? (
                    <SnakeGame
                        onScoreUpdate={handleScoreUpdate}
                        onGameOver={handleGameOver}
                        gameOver={gameOver}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-[400px] h-[400px] bg-base-200 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <RainbowKitCustomConnectButton />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {gameOver && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="stats stats-vertical lg:stats-horizontal shadow">
                            <div className="stat">
                                <div className="stat-title">Final Score</div>
                                <div className="stat-value text-primary text-center">{currentScore}</div>
                            </div>

                        </div>

                        <div id="saveStatus" className="mt-4">
                            {/* This will be updated by JavaScript */}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="btn btn-primary gap-2"
                            onClick={handleRestart}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Play Again
                        </button>
                        <Link href="/leaderboard" className="btn btn-secondary gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            Check Leaderboard
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
} 