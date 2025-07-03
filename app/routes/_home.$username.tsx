import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username";
import { getUserProfileByUsername, prisma } from "~/.server/prisma";
import { Outlet, redirect } from "react-router";
import { Layout, LeftSide, RightSide } from "~/components/layout";
import { HeaderPersonalTabs, StickyHeader } from "~/components/sticky-header";

export default function Page({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
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
          <div className="mt-10"></div>
          _home.$username
          {Object.entries(user || {}).map(([key, value]) => (
            <div className="flex gap-4" key={key}>
              <span>{key}</span>
              <span>{`${value}`}</span>
            </div>
          ))}
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return { user, tweets };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
