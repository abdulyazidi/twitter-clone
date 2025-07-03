import { GalleryVerticalEnd } from "lucide-react";
import type { Route } from "./+types/logout";
import { Form, redirect } from "react-router";
import { authCookie } from "~/.server/cookies";
import { requireAuthRedirect } from "~/.server/auth";
import { prisma } from "~/.server/prisma";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

export default function LogoutPage({ loaderData }: Route.ComponentProps) {
  const { email, username, avatarURL } = loaderData;
  return (
    <div className="grid min-h-svh lg:grid-cols-1">
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
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 rounded-full">
                <AvatarImage
                  src={avatarURL as string | undefined}
                  alt={`${username}'s avatar`}
                />
                <AvatarFallback>
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <CardTitle>{username}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </div>
            </CardContent>
            <CardFooter>
              <Form method="POST" className="w-full">
                <Button type="submit" variant="destructive" className="w-full ">
                  Sign Out
                </Button>
              </Form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  // Ensure the user is authenticated and return their data
  const auth = await requireAuthRedirect(request);
  return {
    email: auth.email,
    username: auth.username,
    avatarURL: auth.avatarURL,
  };
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
