import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username";
import { getUserProfileByUsername, prisma } from "~/.server/prisma";
import { Outlet, redirect } from "react-router";
import { Layout, LeftSide, RightSide } from "~/components/layout";
import { HeaderPersonalTabs, StickyHeader } from "~/components/sticky-header";
import { profileTabs } from "~/lib/globals";
import { cn } from "~/lib/utils";
import { Tweet } from "~/components/tweet";
import type { TweetType } from "~/lib/types";

export default function Page({ loaderData }: Route.ComponentProps) {
  const { user, tweets } = loaderData;
  const { _count } = user;

  return (
    <div>
      <Layout>
        <LeftSide>
          <StickyHeader>
            <HeaderPersonalTabs
              title={user.profile?.displayName || user.username}
              subtitle={`${_count.tweets} ${
                _count.tweets > 1 ? "posts" : "post"
              }`}
            />
          </StickyHeader>

          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-muted"></div>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-4">
              <div className="w-32 h-32 rounded-full bg-muted border-4 border-background"></div>
            </div>

            {/* Edit Profile Button */}
            <div className="absolute bottom-4 right-4">
              <button className="px-4 py-2 border border-border rounded-full text-foreground hover:bg-accent transition-colors">
                Edit profile
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-20 px-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  {user.profile?.displayName || user.username}
                </h1>
                <button className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90 transition-colors">
                  Get verified
                </button>
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {/* Bio */}
            {user.profile?.bio && (
              <p className="text-foreground mb-4">{user.profile.bio}</p>
            )}

            {/* Location and Join Date */}
            <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
              {user.profile?.location && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{user.profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Following/Followers */}
            <div className="flex items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold">
                  {user.followingCount || 0}
                </span>
                <span className="text-muted-foreground">Following</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold">
                  {user.followersCount || 0}
                </span>
                <span className="text-muted-foreground">Followers</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <div className="flex">
              {profileTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={cn(
                    "flex-1 px-4 py-4 font-medium hover:bg-accent transition-colors",
                    tab.isDefault
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Content */}
          <div className="border-t ">
            {tweets.map((t) => {
              return <Tweet tweet={t} />;
            })}
          </div>
        </LeftSide>
        <RightSide>
          <div className="ring block top-0">Stuff here</div>
          <div className="bg-red-500 h-full">hi</div>
        </RightSide>
      </Layout>
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  console.log("BRO");
  const auth = await requireAuthRedirect(request);
  let username = params.username;
  if (username.startsWith("@")) {
    username = username.slice(1);
  } else throw redirect("/404");

  const user = await getUserProfileByUsername({
    userId: auth.userId,
    username,
  });
  if (!user) throw redirect("/404");

  const tweets = await prisma.tweet.findMany({
    where: {
      authorId: user.id,
      type: {
        in: ["TWEET", "QUOTE_TWEET", "RETWEET"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Bookmark: {
        where: {
          userId: auth.userId,
        },
      },
      retweets: {
        where: {
          authorId: auth.userId,
        },
      },
      likes: {
        where: {
          userId: auth.userId,
        },
      },
      media: true,
    },
  });

  // fix later -- typedsql query
  const restructuredTweets: TweetType[] = tweets.map((t) => {
    const media = t.media;
    return {
      // ID
      id: t.id,
      // Author IDs and Info
      authorId: t.authorId,
      username: user.username,
      author: user.username,
      displayName: user.profile?.displayName || user.username,
      avatarURL: user.profile?.avatarURL,
      bio: user.profile?.bio,
      // Tweet Content
      content: t.content,
      type: t.type,
      media: media,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      // Has/Boolean Flags
      hasBookmarked: t.Bookmark.length > 0,
      hasRetweeted: t.retweets.length > 0,
      hasLiked: t.likes.length > 0,
      isBookmarked: t.Bookmark.length > 0,
      isRetweeted: t.retweets.length > 0,
      isLiked: t.likes.length > 0,
      // Counters
      likeCount: t.likes.length,
      retweetCount: t.retweets.length,
      bookmarkCount: t.Bookmark.length,
      replyCount: 0,
      quoteCount: 0,
      followingCount: user.followingCount,
      followerCount: user.followersCount,
    };
  });
  return { user, tweets: restructuredTweets };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
