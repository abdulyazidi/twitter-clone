import type { Route } from "./+types/_home";
import { NavLink, Outlet } from "react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  BellIcon,
  HomeIcon,
  SettingsIcon,
  TwitterIcon,
  SearchIcon,
  BookmarkIcon,
  UserIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  UsersIcon,
  CrownIcon,
} from "lucide-react";
import { MessageCircleIcon } from "lucide-react";
import { cn } from "~/lib/utils";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
    icon: HomeIcon,
  },
  {
    title: "Explore",
    href: "/explore",
    icon: SearchIcon,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: BellIcon,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageCircleIcon,
  },
  {
    title: "Grok",
    href: "/grok",
    icon: SparklesIcon,
  },
  {
    title: "Bookmarks",
    href: "/bookmarks",
    icon: BookmarkIcon,
  },

  {
    title: "Premium",
    href: "/premium",
    icon: CrownIcon,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserIcon,
  },
  {
    title: "More",
    href: "/more",
    icon: MoreHorizontalIcon,
  },
];

// Mock user data - replace with actual user data from your auth system
const mockUser = {
  name: "John Doe",
  username: "@johndoe",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
};

export async function loader({ request }: Route.LoaderArgs) {
  console.log("layout ran");

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div className="grid grid-cols-10 grid-flow-col mx-auto max-w-7xl min-h-screen ">
      {/* sidebar */}
      <div className="col-span-2  border-r bg-background flex flex-col h-screen sticky top-0 overflow-hidden">
        {/* Twitter Logo/Brand */}
        <div className="flex-shrink-0 p-2 lg:p-4">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="p-2 lg:p-3 rounded-full hover:bg-accent transition-colors cursor-pointer">
              <TwitterIcon className="h-5 w-5 lg:h-7 lg:w-7 text-primary" />
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden ">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-0.5 lg:gap-1 px-1 lg:px-2 pb-2 lg:pb-4">
              {sidebarNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center lg:justify-start rounded-full py-2 lg:p-1 group relative ",
                      isActive && "font-bold"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-4 text-xl p-2 lg:px-4 lg:py-2 rounded-full group-hover:bg-accent w-fit">
                        <item.icon
                          className="size-5 lg:size-7 shrink-0"
                          strokeWidth={isActive ? 2.5 : 2}
                          fill={isActive ? "currentColor" : "none"}
                        />
                        <span
                          className={cn(
                            "hidden lg:block text-xl",
                            isActive && "font-bold"
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Post Button - Always Visible */}
          <div className="flex-shrink-0 px-2 lg:px-5 pb-2 lg:pb-4">
            <Button
              className="w-full h-10 lg:h-12 text-base lg:text-lg font-bold rounded-full"
              size="lg"
            >
              <span className="hidden lg:block">Post</span>
              <span className="lg:hidden text-xl">+</span>
            </Button>
          </div>
        </div>

        {/* User Profile Section - Always Visible */}
        <div className="flex-shrink-0 p-1 lg:p-3 border-t border-border">
          <div className="flex items-center justify-center lg:justify-start gap-3 p-2 lg:p-3 rounded-full hover:bg-accent transition-colors cursor-pointer">
            <Avatar className="size-8 lg:size-10">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs lg:text-sm">
                {mockUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="font-bold text-sm truncate text-foreground">
                {mockUser.name}
              </p>
              <p className="text-muted-foreground text-sm truncate">
                {mockUser.username}
              </p>
            </div>
            <MoreHorizontalIcon className="hidden lg:block size-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* main */}
      <div className="col-span-8 bg-background ">
        <Outlet />
      </div>
    </div>
  );
}
