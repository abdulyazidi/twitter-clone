import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username.$tab";
import {
  FEED_TYPES,
  gatTweetFeed,
  type FeedType,
  type GetTweetFeed,
} from "~/.server/queries";
import { Tweet } from "~/components/tweet";
import { prisma } from "~/.server/prisma";

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
  console.log({ tab });
  const target = await prisma.user.findUniqueOrThrow({
    where: {
      username: username.trim().toLowerCase().slice(1),
    },
    select: {
      id: true,
    },
  });
  const feed = await gatTweetFeed({
    targetId: target.id,
    userId: auth.userId,
    type: tab as FeedType,
  });
  console.log(feed);
  return { data: feed, error: null };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export function ErrorBoundary() {
  return <div>ERRORRR</div>;
}
