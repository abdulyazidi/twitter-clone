SELECT
  t.id,
  t.type,
  t."authorId", -- The author of the tweet
  t.content,
  t."likeCount", -- Total likes on the tweet (denormalized)
  t."replyCount",
  t."quoteCount",
  t."retweetCount",
  -- This is the crucial part for your UI:
  CASE
    WHEN l."userId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "isLikedByCurrentUser"
FROM
  "Tweet" t
  LEFT JOIN "Like" l ON t.id = l."tweetId"
  AND l."userId" = $1