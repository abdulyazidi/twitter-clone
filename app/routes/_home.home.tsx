import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home";
import {
  NavLink,
  Outlet,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { CalendarClock, Image, ImagePlay, Smile } from "lucide-react";
import { TweetForm } from "~/components/tweet-form";
import { Layout, LeftSide, RightSide } from "~/components/layout";
import { NON_REVALIDATING_API_ENDPOINTS } from "~/lib/types";

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("_home.home loader ran");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  return null;
}

const homeNavs = [
  {
    href: "/home",
    label: "For you",
  },
  {
    href: "/home/following",
    label: "Following",
  },
] as const;

const iconActions = [
  {
    icon: Image,
    onClick: () => alert("Image clicked"),
  },
  {
    icon: ImagePlay,
    onClick: () => console.log("Video clicked"),
  },
  {
    icon: Smile,
    onClick: () => console.log("Emoji clicked"),
  },
  {
    icon: CalendarClock,
    onClick: () => console.log("Schedule clicked"),
  },
] as const;

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <Layout>
      <LeftSide>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex">
            {homeNavs.map((nav) => (
              <NavLink
                key={nav.href}
                to={nav.href}
                end
                className={({ isActive }) => {
                  let activeStyles =
                    "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-400 after:w-1/6 after:rounded-full after:mx-auto";
                  let inactiveStyles = "text-muted-foreground/60";
                  return `flex-1 text-sm px-4 py-4 text-center font-medium transition-colors relative hover:bg-muted/50 ${
                    isActive ? activeStyles : inactiveStyles
                  } `;
                }}
              >
                {nav.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="divide-y divide-border ">
          {/* Tweet Form */}
          <div>
            <TweetForm action="/api/post-tweet" />
          </div>

          <Outlet />
        </main>
      </LeftSide>

      {/* Right sidebar */}
      <RightSide>
        <div className="sticky top-0 bg-card border rounded-lg h-screen overflow-y-auto">
          <div className="bg-muted/50 p-4 rounded-t-lg">
            <h2 className="text-foreground font-bold">What's happening</h2>
            <p className="text-muted-foreground text-sm">
              Trending topics and news updates
            </p>
          </div>
        </div>
      </RightSide>
    </Layout>
  );
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
