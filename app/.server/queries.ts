import type { TweetType } from "~/lib/types";
import { prisma } from "./prisma";
import { Prisma } from "@prisma-app/client";

export const FEED_TYPES = ["posts", "replies", "media", "likes"] as const;
export type FeedType = (typeof FEED_TYPES)[number];
export interface GetTweetFeed {
  targetId: string;
  userId?: string;
  type: FeedType;
}

/**
 * Get the tweets for the user
 * @param targetId - The ID of the user to get the tweets for
 * @param userId - The ID of the user who made the request(optional)
 * @param type - feed type ex: user's likes, replies or media
 * @returns The tweets for the user
 */
export async function gatTweetFeed({
  targetId,
  userId,
  type,
}: GetTweetFeed): Promise<TweetType[]> {
  // Fix this later -- this is a temporary thing to get the tweets for the user
  let queryFilter: Prisma.TweetWhereInput = {};

  switch (type) {
    case "likes":
      queryFilter = {
        likes: {
          some: {
            userId: targetId,
          },
        },
      };
      break;
    case "media": {
      queryFilter = {
        authorId: targetId,
        media: {
          // this will if it's atleast 1 media linked
          some: {},
        },
      };
      break;
    }
    case "posts": {
      queryFilter = {
        authorId: targetId,
      };
      break;
    }
    case "replies": {
      queryFilter = {
        type: "REPLY",
        authorId: targetId,
      };
    }

    default:
      break;
  }

  // TODO: Pagination - infinite scroll
  const tweets = await prisma.tweet.findMany({
    where: {
      ...queryFilter,
      author: {
        OR: [
          {
            id: userId,
          },
          {
            isPrivate: false,
          },
          {
            isPrivate: true,
            followers: {
              some: {
                followerId: userId,
              },
            },
          },
        ],
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
          userId: userId,
        },
      },
      retweets: {
        where: {
          authorId: userId,
        },
      },
      likes: {
        where: {
          userId: userId,
        },
      },
      media: true,
    },
    take: 20,
  });
  // fix later -- typedsql query?
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
      likeCount: t.likeCount,
      retweetCount: t.retweetCount,
      bookmarkCount: t.bookmarkCount,
      replyCount: t.replyCount,
      quoteCount: t.quoteCount,
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

/**
 * Get a user ID by username
 * @param username - The username of the user to get the ID of (without the @)
 * @returns The user ID or null if does not exist or errored
 */
export async function getUserIdByUsername(
  username: string
): Promise<string | null> {
  try {
    const target = await prisma.user.findUniqueOrThrow({
      where: {
        username: username.trim().toLowerCase(),
      },
      select: {
        id: true,
      },
    });
    return target.id;
  } catch (error) {
    return null;
  }
}
