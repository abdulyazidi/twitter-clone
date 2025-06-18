import { LocalFileStorage } from "@mjackson/file-storage/local";
import { randomUUID } from "node:crypto";
import mime from "mime";
export const fileStorage = new LocalFileStorage("~/../uploads/");

export function getStorageKey(contentType: string) {
  const uuid = randomUUID();
  const extension = mime.getExtension(contentType);
  console.log({ contentType, extension });
  return `${uuid}.${extension}`;
}
