import type { MEDIA_TYPE } from "@prisma-app/client";
import type { LucideIcon } from "lucide-react";

// Tweet types for the application
export interface Tweet {
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
  tweet: Tweet;
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
