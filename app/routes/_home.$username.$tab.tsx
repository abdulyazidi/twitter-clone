import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username.$tab";
import {
  FEED_TYPES,
  gatTweetFeed,
  getUserIdByUsername,
  type FeedType,
  type GetTweetFeed,
} from "~/.server/queries";
import { Tweet } from "~/components/tweet";

export default function TabPage({ loaderData, params }: Route.ComponentProps) {
  const { data, error } = loaderData;

  return (
    <div>
      hello {params.tab} tab
      {data.map((t) => (
        <Tweet tweet={t} key={t.id} />
      ))}
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  const { username, tab } = params;
  if (!FEED_TYPES.includes(tab as FeedType))
    throw { data: null, error: "Invalid Feed Type" };
  const targetId = await getUserIdByUsername(username.slice(1));
  if (!targetId) throw new Error("User not found");
  const feed = await gatTweetFeed({
    targetId: targetId,
    userId: auth.userId,
    type: tab as FeedType,
  });
  return { data: feed, error: null };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div>{`${error}`}</div>;
}
