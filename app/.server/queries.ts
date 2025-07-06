import type { TweetType } from "~/lib/types";
import { prisma } from "./prisma";

/**
 * Get the tweets for the user
 * @param userId - The ID of the user to get the tweets for
 * @param userId2 - The ID of the user who made the request(optional)
 * @returns The tweets for the user
 */
export async function getUserTweets(
  userId: string,
  userId2?: string
): Promise<TweetType[]> {
  // Fix this later -- this is a temporary thing to get the tweets for the user
  const tweets = await prisma.tweet.findMany({
    where: {
      authorId: userId,
      type: {
        in: ["TWEET", "QUOTE_TWEET", "RETWEET"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          username: true,
          followersCount: true,
          followingCount: true,
          profile: {
            select: {
              displayName: true,
              avatarURL: true,
              bio: true,
            },
          },
        },
      },
      Bookmark: {
        where: {
          userId: userId2,
        },
      },
      retweets: {
        where: {
          authorId: userId2,
        },
      },
      likes: {
        where: {
          userId: userId2,
        },
      },
      media: true,
    },
  });

  // fix later -- typedsql query
  const restructuredTweets: TweetType[] = tweets.map((t) => {
    const media = t.media;
    const author = t.author;
    return {
      // ID
      id: t.id,
      // Author IDs and Info
      authorId: t.authorId,
      username: author.username,
      author: author.username,
      displayName: author.profile?.displayName || author.username,
      avatarURL: author.profile?.avatarURL,
      bio: author.profile?.bio,
      // Tweet Content
      content: t.content,
      type: t.type,
      media: media,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      // Has/Boolean Flags
      hasBookmarked: t.Bookmark.length > 0,
      hasRetweeted: t.retweets.length > 0,
      hasLiked: t.likes.length > 0,
      isBookmarked: t.Bookmark.length > 0,
      isRetweeted: t.retweets.length > 0,
      isLiked: t.likes.length > 0,
      // Counters
      likeCount: t.likes.length,
      retweetCount: t.retweets.length,
      bookmarkCount: t.Bookmark.length,
      replyCount: 0,
      quoteCount: 0,
      followingCount: author.followingCount,
      followerCount: author.followersCount,
    };
  });
  return restructuredTweets;
}

/**
 * Get a user profile by username
 * @param requesterId - The user ID of the user who made the request
 * @param username - The username of the user to get the profile of
 * @returns The user profile
 **/
export async function getUserProfileByUsername({
  requesterId,
  username,
}: {
  requesterId: string;
  username: string;
}) {
  // wrap in try catch later
  const user = await prisma.user.findUnique({
    where: {
      username,
      OR: [
        {
          id: requesterId,
        },
        {
          isPrivate: false,
        },
        {
          isPrivate: true,
          followers: {
            some: {
              followerId: requesterId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      followersCount: true,
      followingCount: true,
      createdAt: true,
      isPrivate: true,
      profile: true,
      _count: {
        select: {
          tweets: true,
        },
      },
    },
  });
  return user;
}
