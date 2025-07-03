import type { Route } from "./+types/_home.404";

export default function Page({ loaderData }: Route.ComponentProps) {
  return <div>404 Page</div>;
}

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
