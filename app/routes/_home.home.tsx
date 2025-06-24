import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { Form, NavLink, Outlet, useNavigate } from "react-router";
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

// Mock data generator for tweets
const generateTweets = (count: number) => {
  const users = [
    {
      name: "John Doe",
      username: "johndoe",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Jane Smith",
      username: "janesmith",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b332c2bb?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Mike Johnson",
      username: "mikej",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Sarah Wilson",
      username: "sarahw",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "David Brown",
      username: "davidb",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Emily Davis",
      username: "emilyd",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Alex Turner",
      username: "alexturner",
      avatar:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Lisa Anderson",
      username: "lisaa",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const tweetTemplates = [
    "Just shipped a new feature! 🚀 Excited to see how users respond to the improvements.",
    "Beautiful sunset today 🌅 Nature never fails to amaze me with its colors.",
    "Working on some exciting projects. Can't wait to share more details soon! 💻",
    "Coffee thoughts: Why is the best code always written at 2 AM? ☕",
    "Learning React has been an incredible journey. The community is so supportive! 💙",
    "Hot take: Documentation is just as important as the code itself 📝",
    "Debugging is like being a detective in a crime movie where you're also the murderer 🔍",
    "Just finished reading an amazing book on software architecture. Highly recommend! 📚",
    "TypeScript has completely changed how I write JavaScript. Type safety is everything! 🎯",
    "Weekend project: Building a small CLI tool. Sometimes the simple things are the most fun 🛠️",
    "The feeling when your tests finally pass after hours of debugging 🎉",
    "Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminde coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪",
    "Attending a tech conference virtually today. So many inspiring talks! 🎤",
    "CSS Grid and Flexbox together are pure magic for layouts ✨",
    "Pair programming session went great today. Two minds really are better than one! 👥",
    "Open source contribution feels so rewarding. Love giving back to the community 🤝",
    "Just discovered a new JavaScript library that's going to save me hours of work! 🎁",
    "Architecture decisions from 6 months ago are either genius or terrible. No in-between 🤔",
    "That moment when you realize you've been overthinking a simple problem 💡",
    "Deployment successful! Time to monitor and hope nothing breaks 🤞",
  ];

  const tweets = [];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const content =
      tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    const likes = Math.floor(Math.random() * 1000);
    const retweets = Math.floor(Math.random() * 100);
    const replies = Math.floor(Math.random() * 50);

    // Generate random timestamp within last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const randomTime = new Date(
      thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
    );

    tweets.push({
      id: i + 1,
      user,
      content,
      timestamp: randomTime,
      likes,
      retweets,
      replies,
    });
  }

  return tweets;
};

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("rannnnnnnnn");
  const tweets = await prisma.tweet.findMany({
    where: {
      authorId: auth.userId,
    },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
  return { tweets };
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
  const maxSizeMB = 500000;
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
  const tweets = generateTweets(5);

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

        {/* Tweet Feed */}
        <div className="divide-y divide-border ">
          <Outlet />
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
                {/* <Textarea name="tweet" /> */}
              </div>
            </div>
          </div>
          {loaderData.tweets.map((t: any) => (
            <div className="flex items-center justify-between" key={t.id}>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={t.author.profile?.avatarURL || ""} />
                  <AvatarFallback>
                    {t.author.profile?.displayName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground truncate">
                    {t.author.profile?.displayName}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    @{t.author.username}
                  </p>
                </div>
                <div>
                  <p>{t.content}</p>
                </div>
              </div>
            </div>
          ))}
          {tweets.map((tweet) => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </div>
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

export function Tweet() {
  let date = new Date();

  return (
    <div className="flex gap-2 py-2 px-4">
      {/* Profile photo  */}
      <div className="">
        <Avatar className="bg-muted size-10">
          <AvatarImage src="/favicon.ico" />
          <AvatarFallback>AA</AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex gap-1 text-sm text-zinc-500">
          <div className="font-semibold text-foreground">Abdul</div>
          <div className="text-zinc-500">@Abdulyazidi</div>
          <span>·</span>
          {date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
        <div className="text-sm whitespace-pre-wrap">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus
          repellendus ipsa officiis sit pariatur quaerat repudiandae ad. Totam
          omnis voluptatum, voluptatem, aliquid est deserunt consectetur nemo
          facilis veniam fugiat vel!
        </div>
        {/* Buttons and icons */}
        <div className="flex justify-between text-zinc-500">
          <Button variant={"ghost"} className={cn(iconColors.blue)}>
            <MessageCircleIcon />
          </Button>
          <Button variant={"ghost"} className={cn(iconColors.green)}>
            <Repeat2 className="size-5 " />
          </Button>
          <Button variant={"ghost"} className={cn(iconColors.pink)}>
            <Heart />
          </Button>
          <Button variant={"ghost"} className={cn(iconColors.blue)}>
            <ChartNoAxesColumn />
          </Button>
          <div className="flex ">
            <Button variant={"ghost"} className={cn(iconColors.blue)}>
              <Bookmark />
            </Button>
            <Button variant={"ghost"} className={cn(iconColors.blue)}>
              <Share />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
