import React, { useState } from "react";
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
import {
  InteractionButton,
  type InteractionButtonProps,
} from "./interaction-button";
import { Dialog, DialogContent } from "./ui/dialog";
import { TweetForm } from "./tweet-form";
import { useTweetActions } from "~/hooks/use-tweet-actions";

interface TweetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isCurrentTweet: boolean;
}

const TweetContent = ({
  children,
  isCurrentTweet,
  className,
  onClick,
  ...props
}: TweetContentProps) => {
  let styles = !isCurrentTweet
    ? "cursor-pointer hover:bg-zinc-900/30 transition-colors"
    : "";
  return (
    <div
      className={cn(
        "flex gap-2 py-2 px-4 border-zinc-900 border-b",
        styles,
        className
      )}
      onClick={!isCurrentTweet ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export const Tweet = ({
  tweet,
  hideInteractions = false,
  disableNavigation = false,
}: TweetProps & {
  hideInteractions?: boolean;
  disableNavigation?: boolean;
}) => {
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
    media,
    isFollowingAuthor,
    followingCount,
    followerCount,
  } = tweet;

  const location = useLocation();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Check if we're currently viewing this specific tweet
  const isCurrentTweet = location.pathname === `/@${username}/${id}`;
  const tweetUrl = `/@${username}/tweet/${id}`;
  const [state, tweetActions] = useTweetActions(tweet);

  const { handleRetweet, handleLike, handleFollow, handleBookmark } =
    tweetActions;

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
    if (disableNavigation) {
      return;
    }
    // Allow all (including propagated events) unless dataset propagation is set to stop
    let textSelected = window.getSelection()?.toString();
    let target = e.target as HTMLElement;
    let closestElement = target.closest(
      "[data-propagation=block]"
    ) as HTMLElement | null;
    let propState = closestElement?.dataset.propagation;
    console.log({ propState, closestElement }, "init");
    if (textSelected) return; // If any text selected, always block navigation
    if (propState === "block") {
      e.stopPropagation();
      console.log({ propState }, "Blocked");
      return;
    }

    console.log({ target, propState }, "Allowed");

    navigate(tweetUrl);
  };

  const [isOpen, setIsOpen] = useState<boolean>(false);
  function handleReply(e: React.MouseEvent) {
    setIsOpen(!isOpen);
  }

  return (
    <TweetContent isCurrentTweet={isCurrentTweet} onClick={handleTweetClick}>
      {/* Profile photo */}
      <div className="">
        {hideInteractions ? null : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent data-propagation="block" className="p-0">
              <TweetForm
                action="/api/post-tweet"
                modalMode
                parentTweet={{ tweet }}
                onModalOpenChange={setIsOpen}
              />
            </DialogContent>
          </Dialog>
        )}
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Link
              to={`/@${username}`}
              className="hover:opacity-90"
              data-propagation="block"
            >
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
              isFollowingAuthor: state.isFollowingAuthor || false,
              followingCount: state.followingCount || 0,
              followerCount: state.followerCount || 0,
            }}
            bio={bio || ""}
            data-propagation="block"
          />
        </HoverCard>
      </div>
      {/* Content */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex gap-1 text-sm text-zinc-500">
          <HoverCard openDelay={500} closeDelay={100}>
            <HoverCardTrigger className="flex gap-1" asChild>
              <div className="flex gap-1">
                <Link
                  to={`/@${username}`}
                  className="font-semibold text-foreground hover:underline"
                  data-propagation="block"
                >
                  {displayName}
                </Link>
                <Link
                  to={`/@${username}`}
                  className="text-zinc-500 hover:underline"
                  data-propagation="block"
                >
                  @{username}
                </Link>
              </div>
            </HoverCardTrigger>
            <HoverProfileCard
              username={username}
              avatarURL={avatarURL || ""}
              displayName={displayName || ""}
              handleFollow={handleFollow}
              localState={{
                isFollowingAuthor: state.isFollowingAuthor || false,
                followingCount: state.followingCount || 0,
                followerCount: state.followerCount || 0,
              }}
              bio={bio || ""}
              data-propagation="block"
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
        <p className="text-sm whitespace-pre-wrap">{content || ""}</p>
        {/* Media  */}
        <MediaDisplay mediaURLs={media} data-propagation="block" />
        {/* Buttons and icons */}
        {hideInteractions ? null : (
          <div className="grid grid-cols-5 text-zinc-500">
            {/* TODO: refine types and map over */}
            <InteractionButton
              Icon={MessageCircleIcon}
              color={"blue"}
              count={replyCount}
              data-propagation="block"
              onClick={handleReply}
            />
            <InteractionButton
              Icon={Repeat2}
              color={"green"}
              active={state.retweeted}
              count={state.retweetCount + state.quoteCount}
              data-propagation="block"
              iconClassName="group-data-[checked=true]:fill-none group-data-[checked=true]:text-green-500 size-5"
              onClick={handleRetweet}
            />
            <InteractionButton
              Icon={Heart}
              color={"pink"}
              active={state.liked}
              count={state.likeCount}
              data-propagation="block"
              onClick={handleLike}
            />

            <InteractionButton
              Icon={ChartNoAxesColumn}
              color={"blue"}
              count={0}
              data-propagation="block"
            />
            <div className="grid grid-cols-2">
              <InteractionButton
                Icon={Bookmark}
                color={"blue"}
                count={state.bookmarkCount}
                active={state.bookmarked}
                data-propagation="block"
                onClick={handleBookmark}
              />
              <InteractionButton
                Icon={Share}
                color={"blue"}
                count={0}
                data-propagation="block"
              />
            </div>
          </div>
        )}
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
  ...props
}: {
  username: string;
  avatarURL: string;
  displayName: string;
  handleFollow: (e: React.MouseEvent) => void;
  localState: {
    isFollowingAuthor: boolean;
    followingCount: number;
    followerCount: number;
  };
  bio: string;
}) {
  const { isFollowingAuthor, followingCount, followerCount } = localState;
  return (
    <HoverCardContent
      className="w-72 bg-background shadow-lg border border-border rounded-2xl p-0"
      {...props}
    >
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
