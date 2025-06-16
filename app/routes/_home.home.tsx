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
import { CalendarClock, Image, ImagePlay, Smile } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { CharacterCountIndicator } from "~/components/radial-chart";
import FileUploadComponent from "~/components/file-upload";
import { useFileUpload } from "~/hooks/use-file-upload";

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

// Tweet component
const Tweet = ({ tweet }: { tweet: any }) => {
  const navigate = useNavigate();

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  const handleTweetClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/${tweet.user.username}/${tweet.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle button action here
  };

  return (
    <Card
      className="border-b border-border rounded-none border-x-0 hover:bg-muted/30 ring-inset bg-background transition-colors cursor-pointer py-0"
      onClick={handleTweetClick}
    >
      <CardContent className="px-4 py-3">
        <div className="flex space-x-3">
          <Avatar className="size-10">
            <AvatarImage src={tweet.user.avatar} alt={tweet.user.name} />
            <AvatarFallback>
              {tweet.user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2 ">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground truncate">
                {tweet.user.name}
              </h3>
              <span className="text-muted-foreground text-sm">
                @{tweet.user.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {timeAgo(tweet.timestamp)}
              </span>
            </div>

            <p className=" text-foreground whitespace-pre-wrap break-words">
              {tweet.content}
            </p>

            <div className="flex items-center justify-between ">
              <button
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group"
                onClick={handleButtonClick}
              >
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-sm">{tweet.replies}</span>
              </button>

              <button
                className="flex items-center space-x-2 text-muted-foreground hover:text-green-600 transition-colors group"
                onClick={handleButtonClick}
              >
                <div className="p-2 rounded-full group-hover:bg-green-600/10 transition-colors">
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <span className="text-sm">{tweet.retweets}</span>
              </button>

              <button
                className="flex items-center space-x-2 text-muted-foreground hover:text-red-600 transition-colors group"
                onClick={handleButtonClick}
              >
                <div className="p-2 rounded-full group-hover:bg-red-600/10 transition-colors">
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm">{tweet.likes}</span>
              </button>

              <button
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group"
                onClick={handleButtonClick}
              >
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
  const maxFiles = 4;
  const [fileUploadStates, fileUploadActions] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
  });
  const [input, setInput] = useState<string>("");
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data) {
      console.log("form data", fetcher.data);
    }
  }, [fetcher.data]);
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

    setInput("");
    fileUploadActions.clearFiles();
  };

  return (
    <div className="">
      <Textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        className="dark:bg-transparent border-none focus-visible:ring-0 md:text-2xl break-all resize-none"
        placeholder="What's happening?"
        name="tweet"
      />
      <Separator />

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
