import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home._index";
import { prisma, getUserNewsfeed } from "~/.server/prisma";
import { Tweet } from "./_home.home";
export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  const newsfeed = await prisma.$queryRawTyped(getUserNewsfeed(auth.userId));
  console.table(newsfeed);
  return { newsfeed };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
export default function Page({ loaderData }: Route.ComponentProps) {
  const { newsfeed } = loaderData;
  return (
    <div>
      {newsfeed.map((tweet) => (
        <Tweet key={tweet.id} />
      ))}
    </div>
  );
}
