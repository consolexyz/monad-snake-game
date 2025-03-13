"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";

export default function LeaderboardPage() {
    const { data: highScores = [] } = useScaffoldReadContract({
        contractName: "SnakeGame",
        functionName: "getHighScores",
    });

    return (
        <div className="px-8 md:px-16 lg:px-32 py-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Snake Game Leaderboard</h1>
                <Link href="/snake" className="btn btn-primary">
                    Play Game
                </Link>
            </div>

            <div className="w-full">
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-base-300">
                                <th className="text-lg py-4">Rank</th>
                                <th className="text-lg py-4">Player</th>
                                <th className="text-lg py-4">Score</th>
                                <th className="text-lg py-4">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {highScores?.map((score: any, index: number) => (
                                <tr key={index} className="hover border-b border-base-200">
                                    <td className="py-3">{index + 1}</td>
                                    <td className="py-3">{score.player.slice(0, 6)}...{score.player.slice(-4)}</td>
                                    <td className="py-3">{score.score.toString()}</td>
                                    <td className="py-3">{new Date(Number(score.timestamp) * 1000).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 