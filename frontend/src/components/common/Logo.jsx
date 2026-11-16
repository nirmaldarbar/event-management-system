import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ className, withText = true }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 font-display text-xl font-bold tracking-tight", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[hsl(262_70%_52%)] text-white shadow-glow">
        <Ticket className="h-5 w-5 -rotate-12" />
      </span>
      {withText && <span>EventHub</span>}
    </Link>
  );
}
