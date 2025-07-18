import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home._index";
import { prisma, getUserNewsfeed } from "~/.server/prisma";
import type { TweetType, NewsfeedItem } from "~/lib/types";
import { NON_REVALIDATING_API_ENDPOINTS } from "~/lib/types";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import { Tweet } from "~/components/tweet";
import type { MEDIA_TYPE } from "@prisma-app/client";

export default function Page({ loaderData }: Route.ComponentProps) {
  const { tweetFeed } = loaderData;
  return (
    <div>
      {tweetFeed.map((tweet) => {
        return <Tweet key={tweet.id} tweet={tweet} />;
      })}
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("_home.home._index loader");
  const newsfeed = await prisma.$queryRawTyped(getUserNewsfeed(auth.userId));
  let tweetFeed: TweetType[] = newsfeed.map((tweet) => {
    return {
      id: tweet.id,
      authorId: tweet.authorId,
      username: tweet.authorUsername,
      displayName: tweet.authorDisplayName,
      avatarURL: tweet.authorAvatarURL,
      content: tweet.content,
      createdAt: tweet.createdAt,
      likeCount: tweet.likeCount,
      replyCount: tweet.replyCount,
      quoteCount: tweet.quoteCount,
      bookmarkCount: tweet.bookmarkCount,
      retweetCount: tweet.retweetCount,
      quotedTweetId: tweet.quotedTweetId,
      hasLiked: tweet.hasLiked,
      hasBookmarked: tweet.hasBookmarked,
      hasRetweetedOrQuoted: tweet.hasRetweetedOrQuoted,
      type: tweet.type,
      bio: tweet.authorBio,
      media: tweet.mediaURLs as { url: string; type: MEDIA_TYPE }[],
      isFollowingAuthor: tweet.isFollowingAuthor,
      followingCount: tweet.authorFollowingCount,
      followerCount: tweet.authorFollowerCount,
    };
  });
  return { tweetFeed };
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  return null;
}

export function shouldRevalidate({
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (NON_REVALIDATING_API_ENDPOINTS.includes(formAction as any)) {
    return false;
  }
  return defaultShouldRevalidate;
}
