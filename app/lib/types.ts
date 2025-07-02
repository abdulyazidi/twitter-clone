import { type TWEET_TYPE, type MEDIA_TYPE } from "@prisma-app/client";

// API endpoints that should never trigger revalidation
export const NON_REVALIDATING_API_ENDPOINTS = [
  "/api/like",
  "/api/unlike",
  "/api/bookmark",
  "/api/unbookmark",
  "/api/follow",
  "/api/unfollow",
  "/api/retweet",
  "/api/unretweet",
  "/api/post-tweet",
] as const;

// Type derived from the constant above - union of string literals
export type NonRevalidatingApiEndpoint =
  (typeof NON_REVALIDATING_API_ENDPOINTS)[number];

// Tweet types for the application
export interface TweetType {
  id: string;
  authorId: string;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarURL?: string | null;
  content?: string | null;
  createdAt: Date;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  retweetCount: number;
  bookmarkCount: number;
  quotedTweetId?: string | null;
  hasLiked?: boolean | null;
  hasBookmarked?: boolean | null;
  hasRetweetedOrQuoted?: boolean | null;
  type?: string;
  mediaURLs?: { url: string; type: MEDIA_TYPE }[] | null;
  isFollowingAuthor?: boolean | null;
  followingCount: number;
  followerCount: number;
}

// Props for Tweet component
export interface TweetProps {
  tweet: TweetType;
}

// Newsfeed data structure from the database query (matches SQL result) // This is useless delete later?
export interface NewsfeedItem {
  id: string;
  type: string;
  content: string | null;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  retweetCount: number;
  bookmarkCount: number;
  createdAt: Date;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarURL: string | null;
  authorBio: string | null;
  authorFollowerCount: bigint | null;
  authorFollowingCount: bigint | null;
  hasLiked: boolean | null;
  hasBookmarked: boolean | null;
  hasRetweetedOrQuoted: boolean | null;
  quotedTweetId: string | null;
  mediaURLs: { url: string; type: string }[];
}

export type IconColors = {
  blue: string;
  green: string;
  pink: string;
};

/**
 * Type-safe interface for tweet form data
 */
export interface TweetFormData {
  tweet: string;
  type: TWEET_TYPE;
  replyToId?: string;
  media?: string;
}

/**
 * Type-safe interface for tweet form submission
 */
export interface TweetSubmissionData {
  content: string;
  type: TWEET_TYPE;
  parentTweetId?: string;
  mediaUrl?: string;
  mediaType?: MEDIA_TYPE;
}
