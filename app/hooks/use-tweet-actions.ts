import React, { useCallback, useState } from "react";
import { useFetcher } from "react-router";
import type { TweetType } from "~/lib/types";

export type LocalState = {
  liked?: boolean | null;
  likeCount: number;
  bookmarked?: boolean | null;
  bookmarkCount: number;
  retweeted?: boolean | null;
  retweetCount: number;
  isFollowingAuthor?: boolean | null;
  followingCount: number;
  followerCount: number;
  quoteCount: number;
  replyCount: number;
};

type TweetActions = {
  handleReply: (e: React.MouseEvent) => void;
  handleRetweet: (e: React.MouseEvent) => void;
  handleLike: (e: React.MouseEvent) => void;
  handleFollow: (e: React.MouseEvent) => void;
  handleBookmark: (e: React.MouseEvent) => void;
};

export function useTweetActions(tweet: TweetType): [LocalState, TweetActions] {
  const {
    authorId,
    bookmarkCount,
    createdAt,
    displayName,
    id,
    isFollowingAuthor,
    likeCount,
    retweetCount,
    followerCount,
    quoteCount,
    replyCount,
    followingCount,
    username,
    avatarURL,
    bio,
    content,
    hasBookmarked,
    hasLiked,
    media,
    quotedTweetId,
    hasRetweetedOrQuoted,
    type,
  } = tweet;
  const [state, setState] = useState<LocalState>({
    liked: hasLiked,
    likeCount: likeCount,
    bookmarked: hasBookmarked,
    bookmarkCount: bookmarkCount,
    retweeted: hasRetweetedOrQuoted,
    retweetCount: retweetCount,
    isFollowingAuthor: isFollowingAuthor,
    followingCount: followingCount,
    followerCount: followerCount,
    quoteCount: quoteCount,
    replyCount: replyCount,
  });
  const fetcher = useFetcher();

  const handleReply = useCallback((e: React.MouseEvent) => {
    return null;
  }, []);

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      let formData = new FormData();
      formData.set("tweetId", id);
      fetcher.submit(formData, {
        method: "POST",
        action: state.liked ? "/api/unlike" : "/api/like",
      });
      setState((prev) => {
        let count = prev.liked
          ? Math.max(0, prev.likeCount - 1)
          : prev.likeCount + 1;
        return {
          ...prev,
          liked: !prev.liked,
          likeCount: count,
        };
      });
    },
    [id, state.liked, state.likeCount]
  );
  const handleFollow = useCallback(
    (e: React.MouseEvent) => {
      let formData = new FormData();
      formData.set("authorId", authorId);
      fetcher.submit(formData, {
        method: "POST",
        action: state.isFollowingAuthor ? "/api/unfollow" : "/api/follow",
        preventScrollReset: true,
      });
      setState((prev) => {
        let count = prev.isFollowingAuthor
          ? Math.max(0, prev.followerCount - 1)
          : prev.followerCount + 1;
        return {
          ...prev,
          isFollowingAuthor: !prev.isFollowingAuthor,
          followerCount: count,
        };
      });
    },
    [authorId, state.isFollowingAuthor, state.followerCount]
  );

  const handleBookmark = useCallback(
    (e: React.MouseEvent) => {
      let formData = new FormData();
      formData.set("tweetId", id);
      fetcher.submit(formData, {
        method: "POST",
        action: state.bookmarked ? "/api/unbookmark" : "/api/bookmark",
        preventScrollReset: true,
      });
      setState((prev) => {
        let count = prev.bookmarked
          ? Math.max(0, prev.bookmarkCount - 1)
          : prev.bookmarkCount + 1;
        return {
          ...prev,
          bookmarked: !prev.bookmarked,
          bookmarkCount: count,
        };
      });
    },
    [state.bookmarked, id, state.bookmarkCount]
  );

  function handleRetweet(e: React.MouseEvent) {
    // make quotes
    let formData = new FormData();
    formData.set("tweetId", id);
    fetcher.submit(formData, {
      method: "POST",
      action: state.retweeted ? "/api/unretweet" : "/api/retweet",
    });
    setState((prev) => {
      let count = prev.retweeted
        ? Math.max(0, prev.retweetCount - 1)
        : prev.retweetCount + 1;
      return {
        ...prev,
        retweeted: !prev.retweeted,
        retweetCount: count,
      };
    });
  }

  return [
    state,
    { handleRetweet, handleLike, handleFollow, handleBookmark, handleReply },
  ];
}
