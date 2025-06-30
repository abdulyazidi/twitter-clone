import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TWEET_TYPE, MEDIA_TYPE } from "@prisma-app/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type guards for tweet types
 */
export const isTweetType = (value: string): value is TWEET_TYPE => {
  return Object.values(TWEET_TYPE).includes(value as TWEET_TYPE);
};

export const isMediaType = (value: string): value is MEDIA_TYPE => {
  return Object.values(MEDIA_TYPE).includes(value as MEDIA_TYPE);
};

/**
 * Helper function to validate and parse tweet type
 */
export function parseTweetType(typeString?: string): TWEET_TYPE {
  if (!typeString) {
    return TWEET_TYPE.TWEET; // Default to TWEET
  }

  if (isTweetType(typeString)) {
    return typeString;
  }

  throw new Error(`Invalid tweet type: ${typeString}`);
}

/**
 * Helper function to validate and parse media type
 */
export function parseMediaType(mimeType: string): MEDIA_TYPE {
  if (mimeType.startsWith("image/")) {
    // Check for GIF specifically
    if (mimeType === "image/gif") {
      return MEDIA_TYPE.GIF;
    }
    return MEDIA_TYPE.IMAGE;
  } else if (mimeType.startsWith("video/")) {
    return MEDIA_TYPE.VIDEO;
  } else if (mimeType.startsWith("audio/")) {
    return MEDIA_TYPE.AUDIO;
  }

  throw new Error(`Invalid media type: ${mimeType}`);
}
