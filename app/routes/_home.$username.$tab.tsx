import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username.$tab";
import {
  FEED_TYPES,
  gatTweetFeed,
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
        <Tweet tweet={t} />
      ))}
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  console.log("WTFFFFFFF");
  const auth = await requireAuthRedirect(request);
  const { username, tab } = params;
  if (!FEED_TYPES.includes(tab as FeedType))
    throw { data: null, error: "Invalid Feed Type" };
  const feed = await gatTweetFeed({
    targetId: params.username,
    type: tab as FeedType,
  });
  return { data: feed, error: null };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
