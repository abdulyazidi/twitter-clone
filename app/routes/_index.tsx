import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/_index";
import {
  Card,
  CardDescription,
  CardFooter,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { danger } from "~/.server/auth";
import { Link } from "react-router";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  console.log("loader ran", danger);
  return null;
}

export default function Home() {
  return (
    <div>
      Home
      <div className="flex flex-col gap-8"></div>
    </div>
  );
}
