import {
  HomeIcon,
  SearchIcon,
  BellIcon,
  MessageCircleIcon,
  SparklesIcon,
  BookmarkIcon,
  CrownIcon,
  UserIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import type { IconColors } from "./types";

export const homeNavs = [
  {
    href: "/home",
    label: "For you",
  },
  {
    href: "/home/following",
    label: "Following",
  },
] as const;

export const profileTabs = [
  {
    label: "Posts",
    key: "posts",
    isDefault: true,
  },
  {
    label: "Replies",
    key: "replies",
    isDefault: false,
  },
  {
    label: "Highlights",
    key: "highlights",
    isDefault: false,
  },
  {
    label: "Articles",
    key: "articles",
    isDefault: false,
  },
  {
    label: "Media",
    key: "media",
    isDefault: false,
  },
  {
    label: "Likes",
    key: "likes",
    isDefault: false,
  },
] as const;

export const iconColors: IconColors = {
  blue: "group hover:text-blue-400 hover:!bg-blue-400/10 data-[checked=true]:text-blue-400",
  green:
    "group hover:text-green-400/80 hover:!bg-green-400/10 data-[checked=true]:text-green-400/80",
  pink: "group hover:text-pink-500 hover:!bg-pink-500/10 data-[checked=true]:text-pink-500",
};

export const sidebarNavItems = [
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
] as const;
