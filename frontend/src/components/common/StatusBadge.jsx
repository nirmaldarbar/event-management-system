import { Badge } from "@/components/ui/badge";

const EVENT_STATUS = {
  draft: "secondary",
  published: "success",
  cancelled: "destructive",
  completed: "default",
  pending: "warning",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <Badge variant={EVENT_STATUS[status] || "secondary"} className="capitalize">
      {status}
    </Badge>
  );
}
