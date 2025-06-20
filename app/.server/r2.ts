import { S3Client } from "@aws-sdk/client-s3";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_BUCKET_ENDPOINT = process.env.R2_BUCKET_ENDPOINT!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const BUCKET = R2_BUCKET_NAME;
