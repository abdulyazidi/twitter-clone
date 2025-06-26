SELECT
  t.id,
  t.type,
  t.content,
  t."likeCount",
  t."replyCount",
  t."quoteCount",
  t."retweetCount",
  t."bookmarkCount",
  t."createdAt",
  u.id AS "authorId",
  u.username AS "authorUsername",
  up."displayName" AS "authorDisplayName",
  up."avatarURL" AS "authorAvatarURL",
  -- 1. Aggregate media URLs for the main tweet
  ARRAY_AGG (DISTINCT m.url) FILTER (
    WHERE
      m.url IS NOT NULL
  ) AS "mediaURLs",
  (
    SELECT
      COUNT(*)
    FROM
      "Follow"
    WHERE
      "followingId" = u.id
  ) AS "authorFollowerCount",
  (
    SELECT
      COUNT(*)
    FROM
      "Follow"
    WHERE
      "followerId" = u.id
  ) AS "authorFollowingCount",
  CASE
    WHEN l."userId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "hasLiked",
  CASE
    WHEN b."userId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "hasBookmarked",
  CASE
    WHEN rt."authorId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "hasRetweetedOrQuoted",
  qt.id AS "quotedTweetId",
  qt.content AS "quotedTweetContent",
  qt."createdAt" AS "quotedTweetCreatedAt",
  q_author.id AS "quotedTweetAuthorId",
  q_author.username AS "quotedTweetAuthorUsername",
  q_author_profile."displayName" AS "quotedTweetAuthorDisplayName",
  q_author_profile."avatarURL" AS "quotedTweetAuthorAvatarURL",
  -- 2. Aggregate media URLs for the quoted tweet using a subquery
  (
    SELECT
      ARRAY_AGG (url)
    FROM
      "Media"
    WHERE
      "tweetId" = qt.id
  ) AS "quotedTweetMediaURLs"
FROM
  "Tweet" AS t
  JOIN "User" AS u ON t."authorId" = u.id
  LEFT JOIN "UserProfile" AS up ON u.id = up."userId"
  -- 3. Join to get media for the main tweet
  LEFT JOIN "Media" AS m ON t.id = m."tweetId"
  LEFT JOIN "Tweet" AS qt ON t."quotedTweetId" = qt.id
  LEFT JOIN "User" AS q_author ON qt."authorId" = q_author.id
  LEFT JOIN "UserProfile" AS q_author_profile ON q_author.id = q_author_profile."userId"
  LEFT JOIN "Like" AS l ON l."tweetId" = t.id
  AND l."userId" = $1
  LEFT JOIN "Bookmark" AS b ON b."tweetId" = t.id
  AND b."userId" = $1
  LEFT JOIN "Tweet" AS rt ON rt."authorId" = $1
  AND (
    rt."retweetedTweetId" = t.id
    OR rt."quotedTweetId" = t.id
  )
WHERE
  t.type IN ('TWEET', 'QUOTE_TWEET')
  AND (
    u."isPrivate" = false
    OR EXISTS (
      SELECT
        1
      FROM
        "Follow" f
      WHERE
        f."followerId" = $1
        AND f."followingId" = u.id
    )
  )
  -- 4. New condition to exclude the user's own tweets
  AND t."authorId" != $1
  -- 5. The GROUP BY clause to handle media aggregation
GROUP BY
  t.id,
  u.id,
  up."userId",
  l."userId",
  b."userId",
  rt."authorId",
  qt.id,
  q_author.id,
  q_author_profile."userId"
ORDER BY
  t."createdAt" DESC
LIMIT
  20;