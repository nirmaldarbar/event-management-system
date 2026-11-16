import { Link } from "react-router-dom";
import { Compass, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";

export function ComingSoon({ title = "Coming soon" }) {
  return (
    <div className="container py-24">
      <EmptyState
        icon={Hammer}
        title={title}
        description="We're still building this page. Check back soon."
        action={<Button asChild><Link to="/">Back to home</Link></Button>}
      />
    </div>
  );
}

export function NotFound() {
  return (
    <div className="container py-24">
      <EmptyState
        icon={Compass}
        title="404: page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<Button asChild><Link to="/">Back to home</Link></Button>}
      />
    </div>
  );
}
