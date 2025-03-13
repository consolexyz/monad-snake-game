"use client";

import { useEffect, useState } from "react";
import { SnakeGame } from "./SnakeGame";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function SnakePage() {
    const [currentScore, setCurrentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highScores, setHighScores] = useState<any[]>([]);

    const { data: snakeGameContract } = useScaffoldContract({
        contractName: "SnakeGame",
    });

    const { writeContractAsync } = useScaffoldWriteContract({
        contractName: "SnakeGame",
    });

    const fetchHighScores = async () => {
        if (snakeGameContract) {
            try {
                const scores = await snakeGameContract.read.getHighScores();
                setHighScores(scores || []);
            } catch (error) {
                console.error("Failed to fetch high scores:", error);
            }
        }
    };

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

    useEffect(() => {
        fetchHighScores();
    }, [snakeGameContract]);

    const handleGameOver = async (finalScore: number) => {
        setGameOver(true);
        if (finalScore > 0) {
            try {
                await writeContractAsync({
                    functionName: "submitScore",
                    args: [finalScore],
                });
                // Refresh high scores after submission
                setTimeout(fetchHighScores, 2000);
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
            <div className="text-center mb-8">
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
                <button
                    className="btn btn-primary"
                    onClick={handleRestart}
                >
                    Play Again
                </button>
            )}

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">High Scores</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {highScores?.map((score: any, index: number) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{score.player.slice(0, 6)}...{score.player.slice(-4)}</td>
                                    <td>{score.score.toString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 