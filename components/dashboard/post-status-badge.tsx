import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@prisma/client";

const statusConfig: Record<PostStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" }> = {
  DRAFT: { label: "Draft", variant: "muted" },
  IN_REVIEW: { label: "In Review", variant: "warning" },
  CHANGES_REQUESTED: { label: "Changes Requested", variant: "danger" },
  APPROVED: { label: "Approved", variant: "success" },
  PUBLISHED: { label: "Published", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "default" },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
