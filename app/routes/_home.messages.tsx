import type { Route } from "./+types/_home.messages";

export default function Page({ loaderData }: Route.ComponentProps) {
  return <div>Messages page</div>;
}

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
