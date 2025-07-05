import { Tweet } from "~/components/tweet";
import type { Route } from "./+types/_home.$username_.tweet.$tweetId";
import { requireAuthRedirect } from "~/.server/auth";
import { redirect } from "react-router";
import { prisma } from "~/.server/prisma";
import type { TweetType } from "~/lib/types";
import { Layout, LeftSide, RightSide } from "~/components/layout";

export default function Page({ loaderData }: Route.ComponentProps) {
  const { returnedTweet, replies } = loaderData;
  return (
    <Layout>
      <LeftSide>
        <Tweet tweet={returnedTweet} />
        <div className="flex flex-col gap-4">
          {replies.map((reply) => (
            <Tweet tweet={reply} key={reply.id} />
          ))}
        </div>
      </LeftSide>
      <RightSide>
        <div>Right Side</div>
      </RightSide>
    </Layout>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  const { username, tweetId } = params;
  if (!username || !tweetId) {
    return redirect("/");
  }

  // Fix this query and make it by typedSQL prisma
  const tweet = await prisma.tweet.findUnique({
    where: {
      id: tweetId,
    },
    include: {
      author: {
        select: {
          username: true,
          followersCount: true,
          followingCount: true,
          profile: {
            select: {
              displayName: true,
              avatarURL: true,
              bio: true,
            },
          },
          followers: {
            where: {
              followerId: auth.userId,
            },
            select: {
              followerId: true,
            },
          },
        },
      },
      likes: {
        where: {
          tweetId: tweetId,
          userId: auth.userId,
        },
      },
      Bookmark: {
        where: {
          tweetId,
          userId: auth.userId,
        },
      },
      media: {
        select: {
          url: true,
          type: true,
        },
      },
      retweets: {
        where: {
          retweetedTweetId: tweetId,
          type: "RETWEET",
          authorId: auth.userId,
        },
      },
      replies: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              username: true,
              profile: true,
              followersCount: true,
              followingCount: true,
            },
          },
          media: {
            select: {
              url: true,
              type: true,
            },
          },
          likes: {
            where: {
              userId: auth.userId,
            },
          },
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
        },
      },
    },
  });
  if (!tweet) {
    return redirect("/");
  }
  let returnedTweet: TweetType = {
    id: tweet.id,
    authorId: tweet.authorId,
    username: tweet.author.username,
    displayName: tweet.author.profile?.displayName ?? tweet.author.username,
    avatarURL: tweet.author.profile?.avatarURL,
    createdAt: tweet.createdAt,
    content: tweet.content,
    likeCount: tweet.likeCount,
    hasLiked: tweet.likes.length > 0,
    hasBookmarked: tweet.Bookmark.length > 0,
    replyCount: tweet.replyCount,
    quoteCount: tweet.quoteCount,
    retweetCount: tweet.retweetCount,
    bookmarkCount: tweet.bookmarkCount,
    followingCount: tweet.author.followingCount,
    followerCount: tweet.author.followersCount,
    bio: tweet.author.profile?.bio,
    mediaURLs: tweet.media,
    hasRetweetedOrQuoted: tweet.retweets.length > 0,
    isFollowingAuthor: tweet.author.followers.length > 0,
  };
  let replies: TweetType[] = tweet.replies.map((t) => {
    return {
      id: t.id,
      authorId: t.authorId,
      username: t.author.username,
      displayName: t.author.profile?.displayName ?? t.author.username,
      avatarURL: t.author.profile?.avatarURL,
      createdAt: t.createdAt,
      content: t.content,
      likeCount: t.likeCount,
      replyCount: t.replyCount,
      quoteCount: t.quoteCount,
      retweetCount: t.retweetCount,
      bookmarkCount: t.bookmarkCount,
      followingCount: t.author.followingCount,
      followerCount: t.author.followersCount,
      bio: t.author.profile?.bio,
      mediaURLs: t.media,
      hasLiked: t.likes.length > 0,
      hasBookmarked: t.Bookmark.length > 0,
      hasRetweetedOrQuoted: t.retweets.length > 0,
      isFollowingAuthor: false,
    };
  });
  return { returnedTweet, replies };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
