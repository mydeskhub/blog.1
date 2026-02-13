import { MembershipRole, PlatformRole, PostStatus } from "@prisma/client";

export function isPlatformAdmin(role: PlatformRole | undefined): boolean {
  return role === "ADMIN";
}

export function canEditPost(role: MembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";
}

export function canReviewPost(role: MembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR" || role === "REVIEWER";
}

export function canPublishStatusTransition(role: MembershipRole, nextStatus: PostStatus): boolean {
  if (nextStatus === "PUBLISHED" || nextStatus === "APPROVED") {
    return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
  }

  return canEditPost(role);
}
