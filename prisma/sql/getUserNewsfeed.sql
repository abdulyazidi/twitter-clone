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
  up.bio AS "authorBio",
  -- Aggregate media URLs and types for the main tweet
  ARRAY_AGG (DISTINCT jsonb_build_object('url', m.url, 'type', m.type)) FILTER (
    WHERE
      m.url IS NOT NULL
  ) AS "mediaURLs",
  -- UPDATED: Replaced slow subqueries with fast denormalized counters
  u."followersCount" AS "authorFollowerCount",
  u."followingCount" AS "authorFollowingCount",
  CASE
    WHEN l."userId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "hasLiked",
  CASE
    WHEN b."userId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "hasBookmarked",
  CASE
    WHEN rt."userId" IS NOT NULL OR EXISTS (
      SELECT 1 FROM "Tweet" qt_check 
      WHERE qt_check."authorId" = $1 
      AND qt_check."quotedTweetId" = t.id
    ) THEN TRUE
    ELSE FALSE
  END AS "hasRetweetedOrQuoted",
  CASE
    WHEN f_status."followerId" IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS "isFollowingAuthor",
  qt.id AS "quotedTweetId",
  qt.content AS "quotedTweetContent",
  qt."createdAt" AS "quotedTweetCreatedAt",
  q_author.id AS "quotedTweetAuthorId",
  q_author.username AS "quotedTweetAuthorUsername",
  q_author_profile."displayName" AS "quotedTweetAuthorDisplayName",
  q_author_profile."avatarURL" AS "quotedTweetAuthorAvatarURL",
  -- Aggregate media URLs and types for the quoted tweet using a subquery
  (
    SELECT
      ARRAY_AGG (jsonb_build_object('url', url, 'type', type))
    FROM
      "Media"
    WHERE
      "tweetId" = qt.id
  ) AS "quotedTweetMediaURLs"
FROM
  "Tweet" AS t
  JOIN "User" AS u ON t."authorId" = u.id
  LEFT JOIN "UserProfile" AS up ON u.id = up."userId"
  -- Join to get media for the main tweet
  LEFT JOIN "Media" AS m ON t.id = m."tweetId"
  LEFT JOIN "Tweet" AS qt ON t."quotedTweetId" = qt.id
  LEFT JOIN "User" AS q_author ON qt."authorId" = q_author.id
  LEFT JOIN "UserProfile" AS q_author_profile ON q_author.id = q_author_profile."userId"
  LEFT JOIN "Like" AS l ON l."tweetId" = t.id
  AND l."userId" = $1
  LEFT JOIN "Bookmark" AS b ON b."tweetId" = t.id
  AND b."userId" = $1
  LEFT JOIN "Retweet" AS rt ON rt."userId" = $1
  AND rt."tweetId" = t.id
  -- Join to check the current user's follow status on the tweet author
  LEFT JOIN "Follow" AS f_status ON f_status."followerId" = $1
  AND f_status."followingId" = u.id
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
  -- Exclude the user's own tweets
  AND t."authorId" != $1
  -- The GROUP BY clause to handle media aggregation
GROUP BY
  t.id,
  u.id,
  up."userId",
  l."userId",
  b."userId",
  rt."userId",
  qt.id,
  q_author.id,
  q_author_profile."userId",
  f_status."followerId"
ORDER BY
  t."createdAt" DESC
LIMIT
20;