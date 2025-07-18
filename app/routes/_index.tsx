import { GalleryVerticalEnd } from "lucide-react";
import type { Route } from "./+types/_index";
import { SignupForm } from "~/components/signup-form";
import { Form, redirect } from "react-router";
import { createNewUser } from "~/.server/user-management";
import { authCookie } from "~/.server/cookies";
import { requireAuthRedirect } from "~/.server/auth";

export default function SignupPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-1 ">
      <div className="flex flex-col gap-4 p-6 md:p-10 border-r">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Form className="w-full max-w-xs" method="POST">
            <SignupForm formErrors={actionData?.formErrors} />
          </Form>
        </div>
      </div>
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  // Add your loader logic here
  const auth = await requireAuthRedirect(request);
  if (auth) {
    return redirect("/home");
  }
  return null;
}

export async function action({ request, params }: Route.ActionArgs) {
  // Add your action logic here
  const formData = await request.formData();
  const username = formData.get("username")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const displayName = username;
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";
  console.log("Action ran", username, email, displayName);
  const { user, formErrors } = await createNewUser({
    username,
    email,
    password,
    confirmPassword,
  });
  if (formErrors.hasErrors || !user) {
    console.log("Form errored", formErrors);
    console.log(formData);
    return { user: null, formErrors };
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize({
        userId: user.id,
        username: user.username,
        email: user.email,
        sessionId: user.sessions[0].sessionId,
      }),
    },
  });
}
