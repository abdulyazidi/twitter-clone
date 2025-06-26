import { useState } from "react";
import { Link, useFetcher } from "react-router";
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

const iconColors: {
  blue: string;
  green: string;
  pink: string;
} = {
  blue: "group hover:text-blue-400 hover:!bg-blue-400/10 data-[checked=true]:text-blue-400",
  green:
    "group hover:text-green-400/80 hover:!bg-green-400/10 data-[checked=true]:text-green-400",
  pink: "group hover:text-pink-500 hover:!bg-pink-500/10 data-[checked=true]:text-pink-500",
};

export function Tweet({ tweet }: TweetProps) {
  const {
    id,
    displayName,
    userId,
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
  } = tweet;
  const [localState, setLocalState] = useState<{
    liked: typeof hasLiked;
    likeCount: typeof likeCount;
    bookmarked: typeof hasBookmarked;
    bookmarkCount: typeof bookmarkCount;
  }>({
    liked: hasLiked,
    likeCount: likeCount,
    bookmarked: hasBookmarked,
    bookmarkCount: bookmarkCount,
  });
  const fetcher = useFetcher();

  // can make them all 1 function but i like it this way for this
  function handleLike() {
    let formData = new FormData();
    formData.set("tweetId", id);
    fetcher.submit(formData, {
      method: "POST",
      action: localState.liked ? "/api/unlike" : "/api/like",
      preventScrollReset: true,
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

  const HoverProfileCard = () => (
    <HoverCardContent className="w-80">
      <div className="flex justify-between gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/vercel.png" />
          <AvatarFallback>VC</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">@nextjs</h4>
          <p className="text-sm">
            The React Framework – created and maintained by @vercel.
          </p>
          <div className="text-muted-foreground text-xs">
            Joined December 2021
          </div>
        </div>
      </div>
    </HoverCardContent>
  );

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

  return (
    <div className="flex gap-2 py-2 px-4 border-zinc-900 border-b">
      {/* Profile photo */}
      <div className="">
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Link to={"/home"} className="hover:opacity-90">
              <Avatar className="bg-muted size-10">
                <AvatarImage src={avatarURL || undefined} />
                <AvatarFallback>{username.slice(0, 2) || "X"}</AvatarFallback>
              </Avatar>
            </Link>
          </HoverCardTrigger>
          <HoverProfileCard />
        </HoverCard>
      </div>
      {/* Content */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex gap-1 text-sm text-zinc-500">
          <HoverCard openDelay={500} closeDelay={100}>
            <HoverCardTrigger className="flex gap-1">
              <Link
                to={"/"}
                className="font-semibold text-foreground hover:underline"
              >
                {displayName}
              </Link>
              <Link to={"/"} className="text-zinc-500">
                @{username}
              </Link>
            </HoverCardTrigger>
            <HoverProfileCard />
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
          >
            <Repeat2 className="size-5" />
            {retweetCount + quoteCount > 0 && (
              <span className="text-xs">{retweetCount + quoteCount}</span>
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
    </div>
  );
}
