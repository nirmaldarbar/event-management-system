import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, tint = "bg-primary/10 text-primary", className }) {
  return (
    <Card className={cn("flex items-center gap-4 p-5", className)}>
      <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl border", tint)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-2xl font-bold leading-none">{value}</div>
        <p className="mt-1.5 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
