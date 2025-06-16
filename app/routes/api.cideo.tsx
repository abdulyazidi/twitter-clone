import { getStorageKey } from "~/.server/storage";
import { fileStorage } from "~/.server/storage";
import type { Route } from "./+types/api.cideo";

export async function loader({ params }: Route.LoaderArgs) {
  const storageKey = getStorageKey("lmfao");
  const file = await fileStorage.get(storageKey);

  if (!file) {
    throw new Response("User avatar not found", {
      status: 404,
    });
  }

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename=${file.name}`,
    },
  });
}
