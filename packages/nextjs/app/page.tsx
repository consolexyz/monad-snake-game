"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
          Monad Snake Game
        </h1>
        <p className="text-xl text-base-content/70">
          Play the classic Snake game on the Monad blockchain!
        </p>
        <button
          onClick={() => router.push('/snake')}
          className="btn btn-primary btn-lg text-2xl px-12 py-4 shadow-lg hover:shadow-primary/50 transition-all duration-200 transform hover:scale-105"
        >
          PLAY NOW
        </button>
      </div>
    </div>
  );
}
