-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_personal_best" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_address_idx" ON "Score"("address");

-- CreateIndex
CREATE INDEX "Score_score_idx" ON "Score"("score");

-- CreateIndex
CREATE INDEX "Score_is_personal_best_idx" ON "Score"("is_personal_best");
