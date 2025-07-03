import { ArrowLeft, Search } from "lucide-react";
import type { ReactNode } from "react";
import type React from "react";
import { NavLink, useNavigate } from "react-router";
import { homeNavs } from "~/lib/globals";
import { Button } from "./ui/button";

export function StickyHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 bg-background/30 backdrop-blur-md border-b border-border">
      {children}
    </div>
  );
}

export function HeaderNewsFeedTabs() {
  return (
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
  );
}

export function HeaderPersonalTabs({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 px-2 py-1">
      <Button
        className="rounded-full p-5"
        variant={"ghost"}
        size={"icon"}
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeft className="size-5" />
      </Button>
      <div className="flex-1  ">
        <h1 className="text-xl font-semibold">{title}</h1>
        <h4 className="text-sm text-zinc-500">{subtitle}</h4>
      </div>
      <Button className="rounded-full p-5" variant={"ghost"} size={"icon"}>
        <Search className="size-5" />
      </Button>
    </div>
  );
}
