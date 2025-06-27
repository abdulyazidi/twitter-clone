import { cn } from "~/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface SideProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-background grid grid-cols-3 grid-flow-col gap-6",
        className
      )}
    >
      {children}
    </div>
  );
};

export const LeftSide = ({ children, className }: SideProps) => {
  return (
    <div
      className={cn("ring-inset col-span-3  md:col-span-2 border  ", className)}
    >
      {children}
    </div>
  );
};

export const RightSide = ({ children, className }: SideProps) => {
  return (
    <div className={cn("col-span-1 hidden md:block ", className)}>
      <div className="sticky top-0 bg-card border rounded-lg h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
