import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  NavLink,
  Outlet,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { CalendarClock, Image, ImagePlay, Smile } from "lucide-react";
import { TweetForm } from "~/components/tweet-form";

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
];

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
];

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-background grid grid-cols-3 grid-flow-col gap-6 ">
      <div className=" ring-inset col-span-3  md:col-span-2 border  ">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex">
            {homeNavs.map((nav) => (
              <NavLink
                key={nav.href}
                to={nav.href}
                end
                className={({ isActive }) =>
                  `flex-1 text-sm px-4 py-4 text-center font-medium transition-colors relative hover:bg-muted/50 ${
                    isActive
                      ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-400 after:w-1/6 after:rounded-full after:mx-auto"
                      : "text-muted-foreground/60"
                  }`
                }
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
            <div className="flex gap-4 px-4 py-2">
              <div>
                <Avatar className="size-12 bg-muted">
                  <AvatarImage src="logo-dark.svg"></AvatarImage>
                  <AvatarFallback>FA</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <TweetForm action="/api/post-tweet" />
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>

      {/* Right sidebar */}
      <div className="col-span-1 hidden md:block ">
        <div className="sticky top-0 bg-card border rounded-lg h-screen overflow-y-auto">
          <div className="bg-muted/50 p-4 rounded-t-lg">
            <h2 className="text-foreground font-bold">What's happening</h2>
            <p className="text-muted-foreground text-sm">
              Trending topics and news updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function shouldRevalidate({
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const neva = [
    "/api/like",
    "/api/unlike",
    "/api/bookmark",
    "/api/unbookmark",
    "/api/follow",
    "/api/unfollow",
  ];
  if (neva.includes(formAction || "")) {
    console.log("no validation, returning false");
    return false;
  }
  return defaultShouldRevalidate;
}
