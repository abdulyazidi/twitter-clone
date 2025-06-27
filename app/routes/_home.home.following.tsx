import type { ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/_home.home.following";

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
export default function Page({ loaderData }: Route.ComponentProps) {
  return <div>Following Page</div>;
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
    console.log("shouldRevalidate", formAction);
    return false;
  }
  return defaultShouldRevalidate;
}
