import { HoverCardContent } from "./ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router";

export type HoverProfileCardProps = {
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
};

export function HoverProfileCard({
  username,
  avatarURL,
  displayName,
  handleFollow,
  localState,
  bio,
  ...props
}: HoverProfileCardProps) {
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
            <p className="text-sm">{username}</p>
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
