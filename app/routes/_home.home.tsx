import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import {
  Form,
  NavLink,
  Outlet,
  useNavigate,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { prisma } from "~/.server/prisma";
import { useFetcher } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Bookmark,
  CalendarClock,
  ChartNoAxesColumn,
  Dot,
  Heart,
  Image,
  ImagePlay,
  MessageCircleIcon,
  Repeat2,
  Share,
  Smile,
} from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { CharacterCountIndicator } from "~/components/radial-chart";
import FileUploadComponent from "~/components/file-upload";
import { useFileUpload } from "~/hooks/use-file-upload";
import { cn } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("rannnnnnnnn");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();
  console.log(formData, "api test route ran");
  const tweet = formData.get("tweet")?.toString() || "Hello world";

  const create = await prisma.tweet.create({
    data: {
      authorId: auth.userId,
      type: "TWEET",
      content: tweet,
    },
  });

  return { tweet: create };
}

const homeNavs = [
  {
    href: "/home",
    label: "For you",
  },
  {
    href: "/home/following",
    label: "Following",
  },
];

const iconActions = [
  {
    icon: Image,
    onClick: () => alert("Image clicked"),
  },
  {
    icon: ImagePlay,
    onClick: () => console.log("Video clicked"),
  },
  {
    icon: Smile,
    onClick: () => console.log("Emoji clicked"),
  },
  {
    icon: CalendarClock,
    onClick: () => console.log("Schedule clicked"),
  },
];
export function TweetForm({ action = "api/post-tweet" }: { action?: string }) {
  const maxSizeMB = 50;
  const maxSize = maxSizeMB * 1024 * 1024; // 50MB default
  const maxFiles = 1;

  const [fileUploadStates, fileUploadActions] = useFileUpload({
    multiple: false,
    maxFiles,
    maxSize,
  });

  const [input, setInput] = useState<string>("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.state === "submitting") {
      setIsPosting(true);
      setProg(0);

      intervalRef.current = setInterval(() => {
        setProg((prev) => {
          if (prev < 70) return prev + 2;
          if (prev < 85) return prev + 1;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 100);
    }
    if (fetcher.state === "idle" && isPosting) {
      setProg(100);
      clearProgressInterval();

      setTimeout(() => {
        setInput("");
        fileUploadActions.clearFiles();
        setIsPosting(false);
        setProg(0);
      }, 500);
    }

    return () => clearProgressInterval();
  }, [fetcher.state]);
  const handleSubmit = () => {
    if (!input && fileUploadStates.files.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append("tweet", input);
    fileUploadStates.files.forEach((file) => {
      if (file.file instanceof File) {
        formData.append("media", file.file);
      }
    });

    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action,
      preventScrollReset: true,
    });

    // moved clearing inputs to the useEffect to get a better is posting UX
  };
  const [prog, setProg] = useState(0);
  let intervalId: NodeJS.Timeout | null = null;
  return (
    <>
      {isPosting && <Progress value={prog} className="h-1" />}
      <div
        className={cn("", isPosting ? "pointer-events-none opacity-50" : "")}
      >
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          className="dark:bg-transparent border-none focus-visible:ring-0 md:text-2xl break-all resize-none placeholder:text-zinc-500/90"
          placeholder="What's happening?"
          name="tweet"
        />
        <FileUploadComponent
          fileUploadActions={fileUploadActions}
          fileUploadStates={fileUploadStates}
          maxFiles={maxFiles.toString()}
          maxSizeMB={maxSizeMB.toString()}
        />
        <div className="flex gap-4 items-center">
          {/* {iconActions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={action.onClick}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <action.icon className="size-5" />
            </button>
          ))} */}
          <div className="flex items-center ml-auto ">
            <CharacterCountIndicator currentLength={input.length} />
            <Button
              type="submit"
              name="_action"
              value={"tweeting"}
              size={"lg"}
              className="ml-auto rounded-full"
              onClick={handleSubmit}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  // Generate 300 tweets for the feed

  return (
    <div className="min-h-screen bg-background grid grid-cols-3 grid-flow-col gap-6 ">
      <div className=" ring-inset col-span-3  md:col-span-2 border  ">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex">
            {homeNavs.map((nav) => (
              <NavLink
                key={nav.href}
                to={nav.href}
                end
                className={({ isActive }) =>
                  `flex-1 text-sm px-4 py-4 text-center font-medium transition-colors relative hover:bg-muted/50 ${
                    isActive
                      ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-400 after:w-1/6 after:rounded-full after:mx-auto"
                      : "text-muted-foreground/60"
                  }`
                }
              >
                {nav.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="divide-y divide-border ">
          {/* Tweet Form */}
          <div>
            <div className="flex gap-4 px-4 py-2">
              <div>
                <Avatar className="size-12 bg-muted">
                  <AvatarImage src="logo-dark.svg"></AvatarImage>
                  <AvatarFallback>FA</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <TweetForm action="/api/post-tweet" />
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>

      {/* Right sidebar */}
      <div className="col-span-1 hidden md:block ">
        <div className="sticky top-0 bg-card border rounded-lg h-screen overflow-y-auto">
          <div className="bg-muted/50 p-4 rounded-t-lg">
            <h2 className="text-foreground font-bold">What's happening</h2>
            <p className="text-muted-foreground text-sm">
              Trending topics and news updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function newFunction() {
  return (
    <NavLink
      to={"/home"}
      end
      className={({ isActive }) =>
        `flex-1 px-4 py-4 text-center font-medium transition-colors relative hover:bg-muted/50 ${
          isActive
            ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-400 after:rounded-full bg-red-500"
            : "text-muted-foreground"
        }`
      }
    >
      For you
    </NavLink>
  );
}

const iconColors: {
  blue: string;
  green: string;
  pink: string;
} = {
  blue: "hover:text-blue-400 hover:!bg-blue-400/10",
  green: "hover:text-green-400/80 hover:!bg-green-400/10",
  pink: "hover:text-pink-500 hover:!bg-pink-500/10",
};

import type { TweetProps } from "~/lib/types";

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

export function shouldRevalidate({ formAction }: ShouldRevalidateFunctionArgs) {
  const neva = ["/api/like", "/api/remove-like"];
  if (neva.includes(formAction || "")) {
    return false;
  }
  return true;
}
