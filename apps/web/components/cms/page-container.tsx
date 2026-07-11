import { cn } from "@/lib/utils";

interface PageContainerProps {
  children:   React.ReactNode;
  className?: string;
  /** Removes max-width — for full-width tables */
  fluid?:     boolean;
}

export function PageContainer({ children, className, fluid }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full", !fluid && "max-w-5xl", className)}>
      {children}
    </div>
  );
}
