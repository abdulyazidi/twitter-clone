import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/_home.$username.$tab";

export default function TabPage({ loaderData }: Route.ComponentProps) {
  const { username, tab } = loaderData;

  return <div>hello random tab</div>;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  console.log("WTFFFFFFF");
  const auth = await requireAuthRedirect(request);
  const username = params.username;
  const tab = params.tab || "tweets";
  return { username, tab };
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}
