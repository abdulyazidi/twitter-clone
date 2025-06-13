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
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div className="grid grid-cols-8 grid-flow-col mx-auto max-w-[1440px] min-h-screen">
      {/* sidebar */}
      <div className="col-span-2 border-r bg-background flex flex-col h-screen sticky top-0">
        {/* Twitter Logo/Brand */}
        <div className="p-4">
          <div className="flex items-center justify-center md:justify-start">
            <div className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <TwitterIcon className="h-7 w-7 text-primary" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-1 px-2  ring">
          {sidebarNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center md:justify-start rounded-full p-3 group relative ",
                  isActive && "font-bold"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-4 text-xl p-2 md:px-4 md:py-2 rounded-full group-hover:bg-accent self-end">
                    <item.icon
                      className="size-7 shrink-0 "
                      strokeWidth={isActive ? 2.5 : 2}
                      fill={isActive ? "currentColor" : "none"}
                    />
                    <span
                      className={cn(
                        "hidden md:block text-xl",
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

          {/* Post Button */}
          <div className="mt-4 px-3">
            <Button
              className="w-full h-12 text-lg font-bold rounded-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-none"
              size="lg"
            >
              <span className="hidden md:block">Post</span>
              <span className="md:hidden text-2xl">+</span>
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-3 ">
          <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <Avatar className="size-10">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {mockUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{mockUser.name}</p>
              <p className="text-gray-500 text-sm truncate">
                {mockUser.username}
              </p>
            </div>
            <MoreHorizontalIcon className="hidden md:block size-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* main */}
      <div className="col-span-6 bg-background ring">
        <Outlet />
      </div>
    </div>
  );
}
