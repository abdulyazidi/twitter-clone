import { Tweet } from "~/components/tweet";
import type { Route } from "./+types/_home.$username.$tweetId";
import { requireAuthRedirect } from "~/.server/auth";
import { redirect } from "react-router";
import { prisma } from "~/.server/prisma";
import type { TweetProps } from "~/lib/types";

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  const { username, tweetId } = params;
  if (!username || !tweetId) {
    return redirect("/");
  }
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
    },
  });
  if (!tweet) {
    return redirect("/");
  }
  let returnedTweet: TweetProps["tweet"] = {
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
    isFollowingAuthor: tweet.author.followers.length > 0,
  };
  return { returnedTweet };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <Tweet tweet={loaderData.returnedTweet} />
    </div>
  );
}
