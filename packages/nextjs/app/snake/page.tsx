"use client";

import { useEffect, useState } from "react";
import { SnakeGame } from "./SnakeGame";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";

export default function SnakePage() {
    const [currentScore, setCurrentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

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
            await fetch("/api/relayer/increment", {
                method: "POST",
            });
        } catch (error) {
            console.error("Failed to send score update:", error);
        }
    };

    const handleGameOver = async (finalScore: number) => {
        setGameOver(true);
        if (finalScore > 0) {
            try {
                await writeContractAsync({
                    functionName: "submitScore",
                    args: [finalScore],
                });
            } catch (error) {
                console.error("Failed to submit score:", error);
            }
        }
    };

    const handleRestart = () => {
        setGameOver(false);
        setCurrentScore(0);
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
            )}
        </div>
    );
} 