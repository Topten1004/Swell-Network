-- CreateTable
CREATE TABLE "ApiStats" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "totalUsed" INTEGER NOT NULL,
    "userApiKey" VARCHAR(255) NOT NULL,

    CONSTRAINT "ApiStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiStats_url_userApiKey_key" ON "ApiStats"("url", "userApiKey");

-- AddForeignKey
ALTER TABLE "ApiStats" ADD CONSTRAINT "ApiStats_userApiKey_fkey" FOREIGN KEY ("userApiKey") REFERENCES "User"("apiKey") ON DELETE RESTRICT ON UPDATE CASCADE;
