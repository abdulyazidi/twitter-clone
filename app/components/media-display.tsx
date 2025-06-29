import React, { useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { X } from "lucide-react";

interface MediaItem {
  url: string;
  type: "IMAGE" | "GIF" | "VIDEO" | "AUDIO";
}

interface MediaDisplayProps {
  mediaURLs: MediaItem[] | null | undefined;
  [key: `data-${string}`]: string | undefined;
}

export function MediaDisplay({ mediaURLs, ...props }: MediaDisplayProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!mediaURLs || mediaURLs.length === 0) {
    return null;
  }

  const media = mediaURLs[0];
  // function handleClick(e: React.MouseEvent) {
  //   e.stopPropagation();
  // }
  const renderMedia = () => {
    switch (media.type) {
      case "IMAGE":
      case "GIF":
        return (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild {...props}>
              <div className="cursor-pointer">
                <AspectRatio
                  ratio={16 / 9}
                  className="overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={media.url}
                    alt="Tweet media"
                    className="object-cover w-full h-full hover:brightness-95 "
                  />
                </AspectRatio>
              </div>
            </DialogTrigger>
            <DialogContent
              className=" lg:min-w-[80vh] p-0 bg-transparent border-none overflow-hidden"
              showCloseButton={false}
              {...props}
            >
              <DialogTitle hidden>Media modal</DialogTitle>
              <DialogDescription hidden />
              <div className="relative">
                <DialogClose className="absolute top-3 right-3 z-10 rounded-md bg-card p-2 text-card-foreground shadow-lg hover:ring transition-colors hover:bg-card/80 ">
                  <X className="h-5 w-5 " />
                  <span className="sr-only">Close</span>
                </DialogClose>
                <img
                  src={media.url}
                  alt="Tweet media"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        );

      case "VIDEO":
        return (
          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <video
              src={media.url}
              className="object-cover w-full h-full hover:brightness-95"
              autoPlay
              muted
              loop
              controls
            />
          </AspectRatio>
        );

      case "AUDIO":
        return (
          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <audio
              src={media.url}
              className="object-cover w-full h-full hover:brightness-95 transition-all duration-200"
              controls
            />
          </AspectRatio>
        );

      default:
        return null;
    }
  };

  return <div className="my-3">{renderMedia()}</div>;
}
