import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { iconColors } from "~/lib/globals";
import type { LucideIcon } from "lucide-react";
import type { IconColors } from "~/lib/types";
import type React from "react";

interface InteractionButtonProps extends React.ComponentProps<"button"> {
  color: keyof IconColors;
  count: number;
  Icon: LucideIcon;
  active?: boolean | null;
  iconClassName?: string;
}

export function InteractionButton({
  color,
  count,
  Icon,
  className,
  active,
  iconClassName,
  ...props
}: InteractionButtonProps) {
  // Fix layout icon shifting when a count is added from 0 to n
  return (
    <Button
      variant={"ghost"}
      className={cn(
        iconColors[color],
        "flex items-center gap-1 w-12",
        className
      )}
      {...props}
      data-checked={active}
    >
      <Icon
        className={cn(
          "size-4 group-data-[checked=true]:fill-current",
          iconClassName
        )}
      />
      <span className="text-xs">{count}</span>
    </Button>
  );
}
