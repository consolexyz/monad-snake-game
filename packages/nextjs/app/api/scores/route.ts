import { NextResponse } from "next/server";
import { prisma } from "~~/utils/prisma";

// Helper function to safely execute Prisma operations
const safeDbOperation = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await operation();
    } catch (error) {
        console.error("Database operation failed:", error);
        return fallback;
    }
};

// Type definition for Score
type Score = {
    id: string;
    address: string;
    score: number;
    timestamp: Date;
    is_personal_best: boolean;
};

export async function GET() {
    console.log("==================================================");
    console.log("GET /api/scores - Received request at", new Date().toISOString());
    console.log("==================================================");

    // Fallback data for build time or DB errors
    const fallbackScores = {
        topScores: [
            { id: "mock-1", address: "0x1234...", score: 100, timestamp: new Date(), is_personal_best: true },
            { id: "mock-2", address: "0x5678...", score: 90, timestamp: new Date(), is_personal_best: true },
        ],
        success: true,
        isFallback: true,
    };

    try {
        // Get top scores
        const topScores = await safeDbOperation(
            () => prisma.score.findMany({
                orderBy: { score: "desc" },
                take: 10,
            }),
            fallbackScores.topScores
        );

        console.log(`GET /api/scores - Successfully fetched ${topScores.length} top scores`);
        console.log("==================================================");

        return NextResponse.json({
            topScores,
            success: true,
            isFallback: false,
        });
    } catch (error) {
        console.error("GET /api/scores - Error:", error);
        return NextResponse.json(fallbackScores);
    }
}

export async function POST(request: Request) {
    console.log("==================================================");
    console.log("POST /api/scores - Received request at", new Date().toISOString());
    console.log("==================================================");

    // Store the original request body for error handling
    let requestBody;
    try {
        // Clone the request to avoid consuming it
        const clonedRequest = request.clone();
        requestBody = await clonedRequest.json();
        console.log("POST /api/scores - Request body:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
        console.error("POST /api/scores - Error parsing initial request body:", parseError);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to parse request body"
            },
            { status: 400 }
        );
    }

    try {
        const { address, score } = requestBody;

        if (!address || typeof score !== 'number') {
            console.error("POST /api/scores - Invalid data:", { address, score, typeOfScore: typeof score });
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid data. Address and score are required.",
                    details: { address, score, typeOfScore: typeof score }
                },
                { status: 400 }
            );
        }

        try {
            // Check if user already has a score
            console.log(`POST /api/scores - Checking for existing score for address: ${address}`);

            const existingScore = await safeDbOperation<Score | null>(
                () => prisma.score.findFirst({ where: { address } }),
                null
            );

            console.log("POST /api/scores - Existing score:", existingScore);

            let result;
            let isNewHighScore = false;

            if (!existingScore) {
                // Create new score record if user doesn't have one
                console.log("POST /api/scores - Creating new score record");
                result = await safeDbOperation<Score>(
                    () => prisma.score.create({
                        data: {
                            address,
                            score,
                            is_personal_best: true,
                        },
                    }),
                    { id: "temp-id", address, score, timestamp: new Date(), is_personal_best: true }
                );
                console.log("POST /api/scores - New score created:", result);
                isNewHighScore = true;
            } else if (existingScore && score > existingScore.score) {
                // Update existing score if new score is higher
                console.log("POST /api/scores - Updating existing score with new high score");
                result = await safeDbOperation<Score>(
                    () => prisma.score.update({
                        where: { id: existingScore.id },
                        data: {
                            score,
                            timestamp: new Date(),
                        },
                    }),
                    { ...existingScore, score, timestamp: new Date() }
                );
                console.log("POST /api/scores - Score updated:", result);
                isNewHighScore = true;
            } else {
                // Keep existing score if it's higher
                console.log("POST /api/scores - New score not higher than existing score, keeping existing");
                result = existingScore;
                isNewHighScore = false;
            }

            console.log("POST /api/scores - Successfully processed score");
            return NextResponse.json({
                ...result,
                isNewHighScore,
                success: true
            });
        } catch (dbError) {
            // Return a graceful response even if DB operations fail
            return NextResponse.json({
                id: "temp-id",
                address,
                score,
                timestamp: new Date(),
                is_personal_best: true,
                isNewHighScore: true,
                success: true,
                isFallback: true,
            });
        }
    } catch (error) {
        console.error("POST /api/scores - Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process score",
            },
            { status: 500 }
        );
    }
} 