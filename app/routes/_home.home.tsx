import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.home";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { TweetForm } from "~/components/tweet-form";
import { Layout, LeftSide, RightSide } from "~/components/layout";
import { NON_REVALIDATING_API_ENDPOINTS } from "~/lib/types";
import { homeNavs } from "~/lib/globals";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { HeaderNewsFeedTabs, StickyHeader } from "~/components/sticky-header";

export default function Page({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const location = useLocation();
  return (
    <Layout>
      <LeftSide>
        {/* Header */}
        <StickyHeader>
          <HeaderNewsFeedTabs />

        </StickyHeader>

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
        <div className="flex flex-col  h-full">
          {/* Search Card */}
          <div className="bg-muted/30 rounded-2xl p-4 mb-4">
            <h2 className="text-xl font-bold mb-3">What's happening</h2>
            <div className="space-y-3">
              <div className="hover:bg-muted/50 p-2 rounded-lg cursor-pointer transition-colors">
                <p className="text-sm text-muted-foreground">
                  Trending in Technology
                </p>
                <p className="font-semibold">React Router v7</p>
                <p className="text-sm text-muted-foreground">15.2K posts</p>
              </div>
              <div className="hover:bg-muted/50 p-2 rounded-lg cursor-pointer transition-colors">
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="font-semibold">#WebDevelopment</p>
                <p className="text-sm text-muted-foreground">8,547 posts</p>
              </div>
              <div className="hover:bg-muted/50 p-2 rounded-lg cursor-pointer transition-colors">
                <p className="text-sm text-muted-foreground">
                  Technology · Trending
                </p>
                <p className="font-semibold">TypeScript 5.0</p>
                <p className="text-sm text-muted-foreground">12.1K posts</p>
              </div>
            </div>
          </div>

          {/* Who to Follow Card */}
          <div className="bg-muted/30 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-3">Who to follow</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Jane Developer</p>
                    <p className="text-muted-foreground text-sm">@janedev</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Follow
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Mike Smith</p>
                    <p className="text-muted-foreground text-sm">@mikesmith</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Follow
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Sarah Johnson</p>
                    <p className="text-muted-foreground text-sm">@sarahj</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </RightSide>
    </Layout>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("_home.home loader ran");
  return null;
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
