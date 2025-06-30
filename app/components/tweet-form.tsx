import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { CharacterCountIndicator } from "~/components/radial-chart";
import FileUploadComponent from "~/components/file-upload";
import { useFileUpload } from "~/hooks/use-file-upload";
import { cn } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import type { TweetProps } from "~/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tweet } from "./tweet";
import { TWEET_TYPE } from "@prisma-app/client";

const maxSizeMB = 50;
const maxSize = maxSizeMB * 1024 * 1024; // 50MB default
const maxFiles = 1;

type TweetFormMode = "post" | "reply";

interface TweetFormProps {
  action?: string;
  modalMode?: boolean;
  parentTweet?: TweetProps;
}

export function TweetForm({
  action = "api/post-tweet",
  modalMode,
  parentTweet,
}: TweetFormProps) {
  // Determine mode based on whether parentTweet exists
  const mode: TweetFormMode = parentTweet ? "reply" : "post";

  const [fileUploadStates, fileUploadActions] = useFileUpload({
    multiple: false,
    maxFiles,
    maxSize,
  });

  const [input, setInput] = useState<string>("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.state === "submitting") {
      setIsPosting(true);
      setProg(0);

      intervalRef.current = setInterval(() => {
        setProg((prev) => {
          if (prev < 70) return prev + 2;
          if (prev < 85) return prev + 1;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 100);
    }
    if (fetcher.state === "idle" && isPosting) {
      setProg(100);
      clearProgressInterval();

      setTimeout(() => {
        setInput("");
        fileUploadActions.clearFiles();
        setIsPosting(false);
        setProg(0);
      }, 250);
    }

    return () => clearProgressInterval();
  }, [fetcher.state]);

  const handleSubmit = () => {
    if (!input && fileUploadStates.files.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append("tweet", input);

    // Add tweet type and parent ID based on mode - type-safe with enum values
    if (mode === "reply" && parentTweet) {
      formData.append("replyToId", parentTweet.tweet.id);
      formData.append("type", TWEET_TYPE.REPLY);
    } else {
      formData.append("type", TWEET_TYPE.TWEET);
    }

    fileUploadStates.files.forEach((file) => {
      if (file.file instanceof File) {
        formData.append("media", file.file);
      }
    });

    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action,
      preventScrollReset: true,
    });
  };

  const [prog, setProg] = useState(0);

  const getPlaceholderText = (): string => {
    if (mode === "reply" && parentTweet) {
      return `Reply to @${parentTweet.tweet.username}`;
    }
    return "What's happening?";
  };

  const getButtonText = (): string => {
    return mode === "reply" ? "Reply" : "Post";
  };

  const getActionValue = (): string => {
    return mode === "reply" ? "replying" : "tweeting";
  };

  return (
    <div className={cn("w-full", modalMode && "max-w-2xl")}>
      {isPosting && <Progress value={prog} className="h-1" />}

      {/* Render parent tweet in reply mode */}
      {mode === "reply" && parentTweet && (
        <div className="border-b border-zinc-800">
          <Tweet
            {...parentTweet}
            hideInteractions={true}
            disableNavigation={true}
          />
        </div>
      )}

      <div className="flex gap-4 p-4">
        <div>
          <Avatar className="size-12 bg-muted">
            <AvatarImage src="logo-dark.svg"></AvatarImage>
            <AvatarFallback>FA</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div
            className={cn(
              "",
              isPosting ? "pointer-events-none opacity-50" : ""
            )}
          >
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              className="dark:bg-transparent border-none focus-visible:ring-0 md:text-2xl break-all resize-none placeholder:text-zinc-500/90"
              placeholder={getPlaceholderText()}
              name="tweet"
            />
            <FileUploadComponent
              fileUploadActions={fileUploadActions}
              fileUploadStates={fileUploadStates}
              maxFiles={maxFiles.toString()}
              maxSizeMB={maxSizeMB.toString()}
            />
            <div className="flex gap-4 items-center">
              <div className="flex items-center ml-auto ">
                <CharacterCountIndicator currentLength={input.length} />
                <Button
                  type="submit"
                  name="_action"
                  value={getActionValue()}
                  size={"lg"}
                  className="ml-auto rounded-full"
                  onClick={handleSubmit}
                >
                  {getButtonText()}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
