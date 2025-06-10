import type { Route } from "./+types/signup";

export async function loader({ request, params }: Route.LoaderArgs) {
  // Add your loader logic here
  return null;
}

export async function action({ request, params }: Route.ActionArgs) {
  // Add your action logic here
  const formData = await request.formData();

  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <div>Component Title</div>
    </div>
  );
}
