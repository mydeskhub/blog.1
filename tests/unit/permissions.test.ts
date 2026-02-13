import { describe, expect, it } from "vitest";
import { canEditPost, canPublishStatusTransition, canReviewPost } from "../../lib/permissions";

describe("permissions", () => {
  it("allows authors to edit", () => {
    expect(canEditPost("AUTHOR")).toBe(true);
  });

  it("blocks authors from direct publish", () => {
    expect(canPublishStatusTransition("AUTHOR", "PUBLISHED")).toBe(false);
  });

  it("allows reviewers to review", () => {
    expect(canReviewPost("REVIEWER")).toBe(true);
  });
});
