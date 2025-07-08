import { type TWEET_TYPE, type MEDIA_TYPE } from "@prisma-app/client";
import {
  HomeIcon,
  SearchIcon,
  BellIcon,
  MessageCircleIcon,
  SparklesIcon,
  BookmarkIcon,
  CrownIcon,
  UserIcon,
  MoreHorizontalIcon,
} from "lucide-react";

export type UserType = {
  username: string;
  displayName: string;
  avatarURL?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
};

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
  media: { url: string; type: MEDIA_TYPE }[] | [] | null;
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

// =============================================================================
// FORM DATA SCHEMAS - Type-safe form data extraction for API endpoints
// =============================================================================

/**
 * Form data schemas for different API endpoints
 */
export interface BookmarkFormData {
  tweetId: string;
}

export interface LikeFormData {
  tweetId: string;
}

export interface RetweetFormData {
  tweetId: string;
}

export interface FollowFormData {
  userId: string;
}

export interface PostTweetFormData {
  content: string;
  type: TWEET_TYPE;
  parentTweetId?: string;
  mediaUrl?: string;
  mediaType?: MEDIA_TYPE;
}

/**
 * Union type of all possible form data schemas
 */
export type ApiFormData =
  | BookmarkFormData
  | LikeFormData
  | RetweetFormData
  | FollowFormData
  | PostTweetFormData;

/**
 * Utility function to safely extract and validate form data
 * Usage: const data = extractFormData(formData, ['tweetId'] as const);
 */
export function extractFormData<T extends readonly string[]>(
  formData: FormData,
  requiredFields: T
): Record<T[number], string> | null {
  const result: Record<string, string> = {};

  for (const field of requiredFields) {
    const value = formData.get(field)?.toString();
    if (!value) {
      console.warn(`Missing required field: ${field}`);
      return null;
    }
    result[field] = value;
  }

  return result as Record<T[number], string>;
}

/**
 * Utility function to extract optional form fields
 */
export function extractOptionalFormData(
  formData: FormData,
  fields: readonly string[]
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const field of fields) {
    const value = formData.get(field)?.toString();
    result[field] = value || undefined;
  }

  return result;
}

// =============================================================================
// FORM FIELD CONSTANTS - Use these for consistent field names
// =============================================================================

export const FORM_FIELDS = {
  TWEET_ID: "tweetId",
  USER_ID: "userId",
  CONTENT: "content",
  TYPE: "type",
  PARENT_TWEET_ID: "parentTweetId",
  MEDIA_URL: "mediaUrl",
  MEDIA_TYPE: "mediaType",
} as const;

export type FormField = (typeof FORM_FIELDS)[keyof typeof FORM_FIELDS];

// =============================================================================
// API RESPONSE TYPES - Type-safe API responses
// =============================================================================

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Specific response types for different API endpoints
 */
export interface BookmarkResponse extends ApiResponse {
  success: boolean;
  tweetId?: string;
  error?: string;
}

export interface LikeResponse extends ApiResponse {
  success: boolean;
  tweetId?: string;
  error?: string;
}

export interface FollowResponse extends ApiResponse {
  success: boolean;
  userId?: string;
  error?: string;
}
