import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoadingState({ label = "Loading...", className, fullPage = false }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground",
        fullPage && "min-h-[60vh]",
        className
      )}
      role="status"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
