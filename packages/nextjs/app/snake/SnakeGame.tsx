"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
    x: number;
    y: number;
}

interface Props {
    onScoreUpdate: (score: number) => void;
    onGameOver: (score: number) => void;
    gameOver: boolean;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED = 100;

const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

export const SnakeGame = ({ onScoreUpdate, onGameOver, gameOver }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [snake, setSnake] = useState<Point[]>([]);
    const [food, setFood] = useState<Point>({ x: 0, y: 0 });
    const [direction, setDirection] = useState(Direction.RIGHT);
    const [score, setScore] = useState(0);
    const gameLoopRef = useRef<NodeJS.Timeout>();

    const initializeGame = () => {
        const initialSnake = [];
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            initialSnake.push({
                x: Math.floor(GRID_SIZE / 2) - i,
                y: Math.floor(GRID_SIZE / 2),
            });
        }
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection(Direction.RIGHT);
        setScore(0);
    };

    const generateFood = (currentSnake: Point[]): Point => {
        let newFood: Point | null = null;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (currentSnake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y));
        return newFood;
    };

    const moveSnake = () => {
        const newSnake = [...snake];
        const head = {
            x: (newSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
            y: (newSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
        };

        // Check for collision with self
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            onGameOver(score);
            return;
        }

        newSnake.unshift(head);

        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            const newScore = score + 1;
            setScore(newScore);
            onScoreUpdate(newScore);
            setFood(generateFood(newSnake));
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    };

    const drawGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

        // Draw snake
        ctx.fillStyle = "#4ade80";
        snake.forEach(segment => {
            ctx.fillRect(
                segment.x * CELL_SIZE,
                segment.y * CELL_SIZE,
                CELL_SIZE - 1,
                CELL_SIZE - 1,
            );
        });

        // Draw food
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
            food.x * CELL_SIZE,
            food.y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1,
        );
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowUp":
                    if (direction !== Direction.DOWN) setDirection(Direction.UP);
                    break;
                case "ArrowDown":
                    if (direction !== Direction.UP) setDirection(Direction.DOWN);
                    break;
                case "ArrowLeft":
                    if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
                    break;
                case "ArrowRight":
                    if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [direction]);

    useEffect(() => {
        initializeGame();
    }, [gameOver]);

    useEffect(() => {
        if (!gameOver) {
            gameLoopRef.current = setInterval(() => {
                moveSnake();
            }, GAME_SPEED);
        }

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [snake, direction, food, gameOver]);

    useEffect(() => {
        drawGame();
    }, [snake, food]);

    return (
        <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="border-4 border-primary rounded-lg"
        />
    );
}; 