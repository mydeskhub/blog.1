import slugify from "slugify";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function excerptFromHtml(html: string, maxChars = 180): string {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > maxChars ? `${text.slice(0, maxChars - 3)}...` : text;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
