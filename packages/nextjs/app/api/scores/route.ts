import { NextResponse } from "next/server";
import { prisma } from "~~/utils/prisma";

export async function GET() {
    console.log("==================================================");
    console.log("GET /api/scores - Received request at", new Date().toISOString());
    console.log("==================================================");

    try {
        // Get top scores
        const topScores = await prisma.score.findMany({
            orderBy: {
                score: 'desc',
            },
            take: 10,
        });

        console.log(`GET /api/scores - Successfully fetched ${topScores.length} top scores`);
        console.log("==================================================");

        return NextResponse.json({
            topScores,
            success: true
        });
    } catch (error) {
        console.error("GET /api/scores - Error fetching scores:", error);
        console.log("==================================================");

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch scores from database",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
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

        // Check if user already has a score
        console.log(`POST /api/scores - Checking for existing score for address: ${address}`);

        const existingScore = await prisma.score.findFirst({
            where: {
                address,
            },
        });

        console.log("POST /api/scores - Existing score:", existingScore);

        let result;
        let isNewHighScore = false;

        if (!existingScore) {
            // Create new score record if user doesn't have one
            console.log("POST /api/scores - Creating new score record");
            result = await prisma.score.create({
                data: {
                    address,
                    score,
                    is_personal_best: true,
                },
            });
            console.log("POST /api/scores - New score created:", result);
            isNewHighScore = true;
        } else if (score > existingScore.score) {
            // Update existing score if new score is higher
            console.log("POST /api/scores - Updating existing score with new high score");
            result = await prisma.score.update({
                where: {
                    id: existingScore.id,
                },
                data: {
                    score,
                    timestamp: new Date(),
                },
            });
            console.log("POST /api/scores - Score updated:", result);
            isNewHighScore = true;
        } else {
            // Keep existing score if it's higher
            console.log("POST /api/scores - New score not higher than existing score, keeping existing");
            result = existingScore;
            isNewHighScore = false;
        }

        console.log("POST /api/scores - Successfully processed score");
        console.log("==================================================");
        return NextResponse.json({
            ...result,
            isNewHighScore,
            success: true
        });
    } catch (error) {
        console.error("POST /api/scores - Error saving score:", error);
        console.log("==================================================");

        return NextResponse.json(
            {
                success: false,
                error: "Failed to save score to database",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 