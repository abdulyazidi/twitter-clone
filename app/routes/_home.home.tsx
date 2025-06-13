import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";

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
    "Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪Reminder: Take breaks, stretch, and stay hydrated while coding! 💪",
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
  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  return (
    <Card className="border-b border-border rounded-none border-x-0 hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
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

          <div className="flex-1 min-w-0">
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

            <p className="mt-2 text-foreground whitespace-pre-wrap break-words">
              {tweet.content}
            </p>

            <div className="flex items-center justify-between mt-4 max-w-md">
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
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

              <button className="flex items-center space-x-2 text-muted-foreground hover:text-green-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
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

              <button className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
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

              <button className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
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

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  // Generate 300 tweets for the feed
  const tweets = generateTweets(50);

  return (
    <div className="min-h-screen bg-background ring grid grid-cols-3 grid-flow-col gap-6">
      <div className="ring ring-inset col-span-3  md:col-span-2">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-foreground">Home</h1>
          </div>
        </div>

        {/* Tweet Feed */}
        <div className="divide-y divide-border ring">
          {tweets.map((tweet) => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </div>
      <div className="col-span-1 hidden md:block ">
        <div className="sticky top-0 bg-blue-500 h-screen overflow-y-auto">
          <div className="bg-blue-900 p-4">
            <h2 className="text-white font-bold">Sidebar Content</h2>
            <p className="text-white">
              This content stays at the top while tweets scroll
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
