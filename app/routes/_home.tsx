import type { Route } from "./+types/_home";
import { NavLink, Outlet } from "react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { BellIcon, HomeIcon, SettingsIcon } from "lucide-react";
import { MessageCircleIcon } from "lucide-react";
import { cn } from "~/lib/utils";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/home",
    icon: <HomeIcon />,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: <MessageCircleIcon />,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: <BellIcon />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <SettingsIcon />,
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div className="grid grid-cols-8 grid-flow-col mx-auto max-w-[1440px]">
      {/* sidebar */}
      <div className="col-span-2 bg-red-500">
        <div className="flex flex-col gap-2 p-4">
          {sidebarNavItems.map((e) => (
            <NavLink
              to={e.href}
              className={({ isActive }) => cn(isActive && "bg-blue-500")}
            >
              {e.icon}
              {e.title}
            </NavLink>
          ))}
        </div>
      </div>
      {/* main */}
      <div className="col-span-6 bg-blue-500">
        <Outlet />
      </div>
    </div>
  );
}
