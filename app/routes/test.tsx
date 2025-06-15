import { Form } from "react-router";
import type { Route } from "./+types/test";
import { Button } from "~/components/ui/button";
import { Fuel } from "lucide-react";
import { writeFile } from "node:fs/promises";

import { parseFormData } from "@mjackson/form-data-parser";
import { LocalFileStorage } from "@mjackson/file-storage/local";
import type { FileUpload } from "@mjackson/form-data-parser";

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}
const fileStorage = new LocalFileStorage("./uploads/videos");

export function getStorageKey(userId: string) {
  return `user-${userId}-avatar`;
}

export async function action({ request }: Route.ActionArgs) {
  const contentType = request.headers.get("Content-Type");
  async function uploadHandler(fileUpload: FileUpload) {
    if (fileUpload.fieldName === "file") {
      let storageKey = getStorageKey("lmfao");

      // FileUpload objects are not meant to stick around for very long (they are
      // streaming data from the request.body); store them as soon as possible.
      await fileStorage.set(storageKey, fileUpload);

      // Return a File for the FormData object. This is a LazyFile that knows how
      // to access the file's content if needed (using e.g. file.stream()) but
      // waits until it is requested to actually read anything.
      return fileStorage.get(storageKey);
    }
  }
  const formData = await parseFormData(
    request,
    {
      maxFileSize: 10 * 1024 * 1024 * 7000, // 10MB
    },
    uploadHandler
  );
  const file = formData.get("file");
  if (file) {
    console.log("Success ");
  } else {
    console.log("Fail");
  }
  console.log(contentType);

  return null;
}
export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <span>Hello test</span>
      <Form method="POST" encType="multipart/form-data">
        <input name="file" type="file" />
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
