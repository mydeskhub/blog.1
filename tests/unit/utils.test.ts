import { describe, expect, it } from "vitest";
import { toSlug, excerptFromHtml } from "../../lib/utils";

describe("utils", () => {
  it("creates deterministic slug", () => {
    expect(toSlug("Hello Medium Style World!")).toBe("hello-medium-style-world");
  });

  it("creates excerpt from html", () => {
    expect(excerptFromHtml("<p>Hello <strong>world</strong></p>", 10)).toBe("Hello w...");
  });
});
