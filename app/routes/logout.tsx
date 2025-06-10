import { GalleryVerticalEnd } from "lucide-react";
import type { Route } from "./+types/signup";
import { SignupForm } from "~/components/signup-form";
import { Form, redirect } from "react-router";
import { authCookie } from "~/.server/cookies";
import { requireAuthRedirect } from "~/.server/auth";
import { prisma } from "~/.server/prisma";
import { Button } from "~/components/ui/button";

export async function loader({ request, params }: Route.LoaderArgs) {
  // Add your loader logic here
  return null;
}

export async function action({ request, params }: Route.ActionArgs) {
  // Add your action logic here
  const auth = await requireAuthRedirect(request);
  try {
    const user = await prisma.session.update({
      where: {
        sessionId: auth.sessionId,
        userId: auth.userId,
      },
      data: {
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    console.log("successful logout");
  } catch (error) {
    console.error("Error updating session");
  }
  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize("", {
        maxAge: 0,
      }),
    },
  });
}

export default function LogoutPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-1 ">
      <div className="flex flex-col gap-4 p-6 md:p-10 border-r">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Form className="w-full max-w-xs" method="POST">
            <Button type="submit">Logout</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
