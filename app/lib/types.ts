// Tweet types for the application
export interface Tweet {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarURL?: string | null;
  content?: string | null;
  createdAt: Date;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  retweetCount: number;
  quotedTweetId?: string | null;
  hasLiked?: boolean | null;
  hasRetweetedOrQuoted?: boolean | null;
  type?: string;
}

// Props for Tweet component
export interface TweetProps {
  tweet: Tweet;
}

// Newsfeed data structure from the database query (matches SQL result)
export interface NewsfeedItem {
  id: string;
  type: string;
  content: string | null;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  retweetCount: number;
  createdAt: Date;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarURL: string | null;
  authorFollowerCount: bigint | null;
  authorFollowingCount: bigint | null;
  hasLiked: boolean | null;
  hasRetweetedOrQuoted: boolean | null;
  quotedTweetId: string | null;
  // Add other fields as needed from the SQL query
}
