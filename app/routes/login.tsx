import { GalleryVerticalEnd } from "lucide-react";
import { Form, redirect } from "react-router";
import { loginUser } from "~/.server/user-management";

import { LoginForm } from "~/components/login-form";
import type { Route } from "./+types/login";
import { authCookie } from "~/.server/cookies";

export async function loader({ request, params }: Route.LoaderArgs) {
  // Add your loader logic here
  return null;
}

export async function action({ request, params }: Route.ActionArgs) {
  // Add your action logic here
  const formData = await request.formData();
  const username_email =
    formData.get("username_email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  const { auth, formErrors } = await loginUser({ username_email, password });
  if (formErrors.hasErrors || !auth) {
    return { formErrors, auth: null };
  }
  console.log("authentication successful", auth.email);
  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize({
        userId: auth.userId,
        username: auth.username,
        email: auth.email,
        sessionId: auth.sessionId,
      }),
    },
  });
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-black">
      <div className="flex flex-col gap-4 p-6 md:p-10 border-r">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <Form method="POST" className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm formErrors={actionData?.formErrors} />
          </div>
        </Form>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/x-logo.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] dark:grayscale"
        />
      </div>
    </div>
  );
}
