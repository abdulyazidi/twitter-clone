/*
  Warnings:

  - A unique constraint covering the columns `[authorId,retweetedTweetId,type]` on the table `Tweet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tweet_authorId_retweetedTweetId_type_key" ON "Tweet"("authorId", "retweetedTweetId", "type");
