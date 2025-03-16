"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

type Score = {
    id: string;
    address: string;
    score: number;
    timestamp: string;
    is_personal_best: boolean;
};

export default function LeaderboardPage() {
    const [topScores, setTopScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const { address } = useAccount();

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/scores');
                if (!res.ok) {
                    throw new Error(`Failed to fetch scores: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();

                if (data.error && !data.topScores) {
                    throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
                }

                setTopScores(data.topScores || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching scores:", err);
                setError(`Failed to load leaderboard data: ${err instanceof Error ? err.message : String(err)}`);

                // Auto-retry up to 3 times with increasing delay
                if (retryCount < 3) {
                    const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s
                    console.log(`Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/3)`);
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, delay);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
        const interval = setInterval(fetchScores, 60000);
        return () => clearInterval(interval);
    }, [retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    // Find the user's score in the top scores
    const userScore = topScores.find(score => score.address === address);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="mt-4">Loading leaderboard...</p>
                {retryCount > 0 && (
                    <p className="text-sm opacity-70 mt-2">Retry attempt {retryCount}/3</p>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="alert alert-error max-w-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                </div>
                <button className="btn btn-primary mt-4" onClick={handleRetry}>
                    Try Again
                </button>
                <div className="mt-8">
                    <Link href="/snake" className="btn btn-outline">
                        Play Game Instead
                    </Link>
                </div>
            </div>
        );
    }

    // If we have no scores but no error, show a message
    if (!topScores || topScores.length === 0) {
        return (
            <div className="px-8 md:px-16 lg:px-32 py-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Snake Game Leaderboard</h1>
                    <Link href="/snake" className="btn btn-primary">
                        Play Game
                    </Link>
                </div>
                <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>No scores found. Be the first to play and set a high score!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="px-8 md:px-16 lg:px-32 py-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Snake Game Leaderboard</h1>
                <Link href="/snake" className="btn btn-primary">
                    Play Game
                </Link>
            </div>

            {error && (
                <div className="alert alert-warning mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>{error}</span>
                </div>
            )}

            {userScore && (
                <div className="mb-8 p-4 bg-primary/20 rounded-lg">
                    <h3 className="text-xl font-bold">Your Best Score</h3>
                    <p className="text-2xl">{userScore.score}</p>
                    <p className="text-sm opacity-70">
                        Achieved on {new Date(userScore.timestamp).toLocaleDateString()}
                    </p>
                </div>
            )}

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
                            {topScores.map((score, index) => (
                                <tr key={score.id} className={score.address === address ? "bg-primary/10" : ""}>
                                    <td className="py-3">{index + 1}</td>
                                    <td className="py-3">
                                        {score.address === address ? "You" :
                                            `${score.address.slice(0, 6)}...${score.address.slice(-4)}`}
                                    </td>
                                    <td className="py-3">{score.score}</td>
                                    <td className="py-3">{new Date(score.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 