import type { Route } from "./+types/_home.messages";

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
export default function Page({ loaderData }: Route.ComponentProps) {
  return <div>Messages page</div>;
}
