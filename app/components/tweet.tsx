import { useState } from "react";
import { Link, useFetcher, useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  MessageCircleIcon,
  Repeat2,
  Share,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { TweetProps } from "~/lib/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { MediaDisplay } from "./media-display";

const iconColors: {
  blue: string;
  green: string;
  pink: string;
} = {
  blue: "group hover:text-blue-400 hover:!bg-blue-400/10 data-[checked=true]:text-blue-400",
  green:
    "group hover:text-green-400/80 hover:!bg-green-400/10 data-[checked=true]:text-green-400/80",
  pink: "group hover:text-pink-500 hover:!bg-pink-500/10 data-[checked=true]:text-pink-500",
};

interface TweetContentProps {
  children: React.ReactNode;
  isCurrentTweet: boolean;
  onTweetClick?: (e: React.MouseEvent) => void;
}

const TweetContent = ({
  children,
  isCurrentTweet,
  onTweetClick,
}: TweetContentProps) => {
  if (isCurrentTweet) {
    return (
      <div className="flex gap-2 py-2 px-4 border-zinc-900 border-b">
        {children}
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 py-2 px-4 border-zinc-900 border-b cursor-pointer hover:bg-zinc-900/30 transition-colors"
      onClick={onTweetClick}
    >
      {children}
    </div>
  );
};

export const Tweet = ({ tweet }: TweetProps) => {
  const {
    id,
    displayName,
    authorId,
    username,
    avatarURL,
    content,
    createdAt,
    likeCount,
    replyCount,
    retweetCount,
    quoteCount,
    bookmarkCount,
    hasLiked,
    hasBookmarked,
    type,
    hasRetweetedOrQuoted,
    quotedTweetId,
    bio,
    mediaURLs,
    isFollowingAuthor,
    followingCount,
    followerCount,
  } = tweet;

  const location = useLocation();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Check if we're currently viewing this specific tweet
  const isCurrentTweet = location.pathname === `/@${username}/${id}`;
  const tweetUrl = `/@${username}/${id}`;

  const [localState, setLocalState] = useState<{
    liked: typeof hasLiked;
    likeCount: typeof likeCount;
    bookmarked: typeof hasBookmarked;
    bookmarkCount: typeof bookmarkCount;
    retweeted: typeof hasRetweetedOrQuoted;
    retweetCount: typeof retweetCount;
    isFollowingAuthor: typeof isFollowingAuthor;
    followingCount: typeof followingCount;
    followerCount: typeof followerCount;
    quoteCount: typeof quoteCount;
    replyCount: typeof replyCount;
  }>({
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

  // can make them all 1 function but i like it this way for this
  function handleLike() {
    let formData = new FormData();
    formData.set("tweetId", id);
    fetcher.submit(formData, {
      method: "POST",
      action: localState.liked ? "/api/unlike" : "/api/like",
    });
    setLocalState((prev) => {
      let count = prev.liked
        ? Math.max(0, prev.likeCount - 1)
        : prev.likeCount + 1;
      return {
        ...prev,
        liked: !prev.liked,
        likeCount: count,
      };
    });
  }

  function handleFollow() {
    let formData = new FormData();
    formData.set("authorId", authorId);
    fetcher.submit(formData, {
      method: "POST",
      action: localState.isFollowingAuthor ? "/api/unfollow" : "/api/follow",
      preventScrollReset: true,
    });
    setLocalState((prev) => {
      let count = prev.isFollowingAuthor
        ? Math.max(0, prev.followerCount - 1)
        : prev.followerCount + 1;
      return {
        ...prev,
        isFollowingAuthor: !prev.isFollowingAuthor,
        followerCount: count,
      };
    });
  }

  function handleBookmark() {
    let formData = new FormData();
    formData.set("tweetId", id);
    fetcher.submit(formData, {
      method: "POST",
      action: localState.bookmarked ? "/api/unbookmark" : "/api/bookmark",
      preventScrollReset: true,
    });
    setLocalState((prev) => {
      let count = prev.bookmarked
        ? Math.max(0, prev.bookmarkCount - 1)
        : prev.bookmarkCount + 1;
      return {
        ...prev,
        bookmarked: !prev.bookmarked,
        bookmarkCount: count,
      };
    });
  }

  const DateHoverCard = () => (
    <HoverCardContent className="">
      <div className="text-xs space-y-1">
        <div>
          {createdAt.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </HoverCardContent>
  );

  const handleTweetClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest('[role="button"]') ||
      target.closest(".media-container") ||
      isCurrentTweet
    ) {
      return;
    }

    // Navigate to tweet page
    navigate(tweetUrl);
  };

  function handleRetweet() {
    // make quotes
    let formData = new FormData();
    formData.set("tweetId", id);
    fetcher.submit(formData, {
      method: "POST",
      action: localState.retweeted ? "/api/unretweet" : "/api/retweet",
    });
    setLocalState((prev) => {
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

  return (
    <TweetContent
      isCurrentTweet={isCurrentTweet}
      onTweetClick={handleTweetClick}
    >
      {/* Profile photo */}
      <div className="">
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Link to={`/@${username}`} className="hover:opacity-90">
              <Avatar className="bg-muted size-10">
                <AvatarImage src={avatarURL || undefined} />
                <AvatarFallback>{username.slice(0, 2) || "X"}</AvatarFallback>
              </Avatar>
            </Link>
          </HoverCardTrigger>
          <HoverProfileCard
            username={username}
            avatarURL={avatarURL || ""}
            displayName={displayName || ""}
            handleFollow={handleFollow}
            localState={{
              isFollowingAuthor: localState.isFollowingAuthor || false,
              followingCount: localState.followingCount || 0,
              followerCount: localState.followerCount || 0,
            }}
            bio={bio || ""}
          />
        </HoverCard>
      </div>
      {/* Content */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex gap-1 text-sm text-zinc-500">
          <HoverCard openDelay={500} closeDelay={100}>
            <HoverCardTrigger className="flex gap-1">
              <Link
                to={`/@${username}`}
                className="font-semibold text-foreground hover:underline"
              >
                {displayName}
              </Link>
              <Link to={`/@${username}`} className="text-zinc-500">
                @{username}
              </Link>
            </HoverCardTrigger>
            <HoverProfileCard
              username={username}
              avatarURL={avatarURL || ""}
              displayName={displayName || ""}
              handleFollow={handleFollow}
              localState={{
                isFollowingAuthor: localState.isFollowingAuthor || false,
                followingCount: localState.followingCount || 0,
                followerCount: localState.followerCount || 0,
              }}
              bio={bio || ""}
            />
          </HoverCard>
          <span>·</span>
          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <span className="cursor-help hover:underline">
                {createdAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </HoverCardTrigger>
            <DateHoverCard />
          </HoverCard>
        </div>
        <div className="text-sm whitespace-pre-wrap">{content || ""}</div>
        {/* Media  */}
        <div className="media-container">
          <MediaDisplay mediaURLs={mediaURLs} />
        </div>
        {/* Buttons and icons */}
        <div className="flex justify-between text-zinc-500">
          <Button
            variant={"ghost"}
            className={cn(iconColors.blue, "flex items-center gap-1")}
          >
            <MessageCircleIcon className="size-4" />
            {replyCount > 0 && <span className="text-xs">{replyCount}</span>}
          </Button>
          <Button
            variant={"ghost"}
            className={cn(iconColors.green, "flex items-center gap-1")}
            onClick={handleRetweet}
            data-checked={localState.retweeted}
          >
            <Repeat2 className={cn("size-5 ")} />
            {localState.retweetCount + localState.quoteCount > 0 && (
              <span className="text-xs">
                {localState.retweetCount + localState.quoteCount}
              </span>
            )}
          </Button>
          <Button
            variant={"ghost"}
            data-checked={localState.liked}
            className={cn(iconColors.pink, "flex items-center gap-1")}
            onClick={handleLike}
          >
            <Heart
              className={cn("size-4 group-data-[checked=true]:fill-current")}
            />
            {localState.likeCount > 0 && (
              <span className="text-xs">{localState.likeCount}</span>
            )}
          </Button>
          <Button variant={"ghost"} className={cn(iconColors.blue)}>
            <ChartNoAxesColumn className="size-4" />
          </Button>
          <div className="flex">
            <Button
              variant={"ghost"}
              className={cn(iconColors.blue)}
              onClick={handleBookmark}
              data-checked={localState.bookmarked}
            >
              <Bookmark
                className={cn("size-4 group-data-[checked=true]:fill-current")}
              />
            </Button>
            <Button variant={"ghost"} className={cn(iconColors.blue)}>
              <Share className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </TweetContent>
  );
};

export function HoverProfileCard({
  username,
  avatarURL,
  displayName,
  handleFollow,
  localState,
  bio,
}: {
  username: string;
  avatarURL: string;
  displayName: string;
  handleFollow: () => void;
  localState: {
    isFollowingAuthor: boolean;
    followingCount: number;
    followerCount: number;
  };
  bio: string;
}) {
  const { isFollowingAuthor, followingCount, followerCount } = localState;
  return (
    <HoverCardContent className="w-72 bg-background shadow-lg border border-border rounded-2xl p-0">
      <div className="flex flex-col gap-3 p-4">
        {/* Avatar and Follow Button */}
        <div className="flex justify-between items-start">
          <Link
            to={`/${username}`}
            className="hover:opacity-90 transition-opacity"
          >
            <Avatar className="size-16 bg-muted">
              <AvatarImage src={avatarURL || undefined} />
              <AvatarFallback className="text-lg">
                {displayName?.slice(0, 2).toUpperCase() ||
                  username.slice(0, 2).toUpperCase() ||
                  "X"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button
            variant="default"
            size="sm"
            className="rounded-full px-4 py-1 text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors"
            onClick={handleFollow}
            data-checked={isFollowingAuthor}
          >
            {isFollowingAuthor ? "Unfollow" : "Follow"}
          </Button>
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <Link to={`/${username}`} className="block hover:underline">
            <div className="flex items-center gap-1">
              <h4 className="text-xl font-bold text-foreground leading-tight">
                {displayName || username}
              </h4>
              {/* Verification badge placeholder - you can add logic here later */}
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </Link>
          <Link
            to={`/${username}`}
            className="block text-muted-foreground hover:underline"
          >
            <p className="text-sm">@{username}</p>
          </Link>
        </div>

        {/* Bio */}
        {bio && <p className="text-sm text-foreground leading-normal">{bio}</p>}

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <Link
            to={`/${username}/following`}
            className="hover:underline text-muted-foreground"
          >
            <span className="font-bold text-foreground">{followingCount}</span>
            <span className="ml-1">Following</span>
          </Link>
          <Link
            to={`/${username}/followers`}
            className="hover:underline text-muted-foreground"
          >
            <span className="font-bold text-foreground">{followerCount}</span>
            <span className="ml-1">Followers</span>
          </Link>
        </div>

        {/* Followed by section */}
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              <Avatar className="size-5 border border-background">
                <AvatarImage src="https://github.com/vercel.png" />
                <AvatarFallback className="text-xs">V</AvatarFallback>
              </Avatar>
              <Avatar className="size-5 border border-background">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="text-xs">S</AvatarFallback>
              </Avatar>
            </div>
            <span>Followed by vercel, shadcn, and 3 others you follow</span>
          </div>
        </div>

        {/* Profile Summary Button */}
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-full rounded-full font-bold text-sm py-2 mt-2 border-2"
        >
          Profile Summary
        </Button>
      </div>
    </HoverCardContent>
  );
}
