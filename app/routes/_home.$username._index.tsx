import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username._index";
import { gatTweetFeed, getUserIdByUsername } from "~/.server/queries";
import { Tweet } from "~/components/tweet";

export default function Page({ loaderData }: Route.ComponentProps) {
  const { tweets } = loaderData;
  return (
    <div className="flex flex-col gap-4">
      {tweets.map((t) => {
        return <Tweet tweet={t} />;
      })}
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  const targetId = await getUserIdByUsername(params.username.slice(1));
  if (!targetId) throw new Error("User not found");
  const tweets = await gatTweetFeed({
    targetId: targetId,
    type: "posts",
    userId: auth.userId,
  });

  return { tweets };
}
