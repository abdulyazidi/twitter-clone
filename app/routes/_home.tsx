import type { Route } from "./+types/_home";
import { Outlet } from "react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { AppSidebar } from "~/components/sidebar-left";

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
