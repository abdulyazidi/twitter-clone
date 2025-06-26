import { useState } from "react";
import { useFetcher } from "react-router";
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

const iconColors: {
  blue: string;
  green: string;
  pink: string;
} = {
  blue: "hover:text-blue-400 hover:!bg-blue-400/10",
  green: "hover:text-green-400/80 hover:!bg-green-400/10",
  pink: "hover:text-pink-500 hover:!bg-pink-500/10",
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
    hasLiked,
  } = tweet;
  const fetcher = useFetcher();
  const [liked, setLiked] = useState<typeof hasLiked>(hasLiked);
  const [localLikeCount, setLocalLikeCount] =
    useState<typeof likeCount>(likeCount);
  return (
    <div className="flex gap-2 py-2 px-4">
      {/* Profile photo  */}
      <div className="">
        <Avatar className="bg-muted size-10">
          <AvatarImage src={avatarURL || undefined} />
          <AvatarFallback>{username.slice(0, 2) || "X"}</AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex gap-1 text-sm text-zinc-500">
          <div className="font-semibold text-foreground">{displayName}</div>
          <div className="text-zinc-500">@{username}</div>
          <span>·</span>
          {createdAt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
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
            className={cn(
              liked ? "text-pink-500" : "",
              iconColors.pink,
              "flex items-center gap-1"
            )}
            onClick={(e) => {
              let formData = new FormData();
              formData.set("tweetId", id);
              fetcher.submit(formData, {
                method: "POST",
                action: liked ? "/api/unlike" : "/api/like",
                preventScrollReset: true,
              });
              setLiked(!liked);
              setLocalLikeCount((prev) => {
                let count = liked ? Math.max(0, prev - 1) : prev + 1;
                return count;
              });
            }}
          >
            <Heart className={cn("size-4", liked ? "fill-current" : "")} />
            {localLikeCount > 0 && (
              <span className="text-xs">{localLikeCount}</span>
            )}
          </Button>
          <Button variant={"ghost"} className={cn(iconColors.blue)}>
            <ChartNoAxesColumn className="size-4" />
          </Button>
          <div className="flex ">
            <Button variant={"ghost"} className={cn(iconColors.blue)}>
              <Bookmark className="size-4" />
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
