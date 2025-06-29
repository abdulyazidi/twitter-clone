import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { CharacterCountIndicator } from "~/components/radial-chart";
import FileUploadComponent from "~/components/file-upload";
import { useFileUpload } from "~/hooks/use-file-upload";
import { cn } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";

const maxSizeMB = 50;
const maxSize = maxSizeMB * 1024 * 1024; // 50MB default
const maxFiles = 1;

export function TweetForm({ action = "api/post-tweet" }: { action?: string }) {
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
      }, 250); // timeout feels better than instant for this one imo
    }

    return () => clearProgressInterval();
  }, [fetcher.state]);
  const handleSubmit = () => {
    if (!input && fileUploadStates.files.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append("tweet", input);
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

    // moved clearing inputs to the useEffect to get a better is posting UX
  };
  const [prog, setProg] = useState(0);
  let intervalId: NodeJS.Timeout | null = null;
  return (
    <>
      {isPosting && <Progress value={prog} className="h-1" />}
      <div
        className={cn("", isPosting ? "pointer-events-none opacity-50" : "")}
      >
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          className="dark:bg-transparent border-none focus-visible:ring-0 md:text-2xl break-all resize-none placeholder:text-zinc-500/90"
          placeholder="What's happening?"
          name="tweet"
        />
        <FileUploadComponent
          fileUploadActions={fileUploadActions}
          fileUploadStates={fileUploadStates}
          maxFiles={maxFiles.toString()}
          maxSizeMB={maxSizeMB.toString()}
        />
        <div className="flex gap-4 items-center">
          {/* {iconActions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={action.onClick}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <action.icon className="size-5" />
            </button>
          ))} */}
          <div className="flex items-center ml-auto ">
            <CharacterCountIndicator currentLength={input.length} />
            <Button
              type="submit"
              name="_action"
              value={"tweeting"}
              size={"lg"}
              className="ml-auto rounded-full"
              onClick={handleSubmit}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
