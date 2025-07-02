import type { ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/_home.home.following";
import { NON_REVALIDATING_API_ENDPOINTS } from "~/lib/types";

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
  if (NON_REVALIDATING_API_ENDPOINTS.includes(formAction as any)) {
    return false;
  }
  return defaultShouldRevalidate;
}
