import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home._index";
import { prisma, getUserNewsfeed } from "~/.server/prisma";
import type { Tweet as TweetType, NewsfeedItem } from "~/lib/types";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import { Tweet } from "~/components/tweet";

export function shouldRevalidate({
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const neva = ["/api/like", "/api/unlike"];
  if (neva.includes(formAction || "")) {
    return false;
  }
  return defaultShouldRevalidate;
}

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("_home.home._index loader");
  const newsfeed = await prisma.$queryRawTyped(getUserNewsfeed(auth.userId));
  return { newsfeed };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { newsfeed } = loaderData;

  return (
    <div>
      {newsfeed.map((tweet: NewsfeedItem) => {
        // Transform the newsfeed data to match the Tweet type
        const tweetData: TweetType = {
          id: tweet.id,
          userId: tweet.authorId,
          username: tweet.authorUsername,
          displayName: tweet.authorDisplayName,
          avatarURL: tweet.authorAvatarURL,
          content: tweet.content,
          createdAt: tweet.createdAt,
          likeCount: tweet.likeCount,
          replyCount: tweet.replyCount,
          quoteCount: tweet.quoteCount,
          retweetCount: tweet.retweetCount,
          quotedTweetId: tweet.quotedTweetId,
          hasLiked: tweet.hasLiked,
          hasRetweetedOrQuoted: tweet.hasRetweetedOrQuoted,
          type: tweet.type,
        };

        return <Tweet key={tweet.id} tweet={tweetData} />;
      })}
    </div>
  );
}
