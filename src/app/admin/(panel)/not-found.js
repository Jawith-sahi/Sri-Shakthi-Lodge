import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function AdminNotFound() {
  return (
    <EmptyState
      title="Not found"
      body="That admin page does not exist."
      action={
        <LinkButton plain href="/admin/dashboard">
          Back to dashboard
        </LinkButton>
      }
    />
  );
}
