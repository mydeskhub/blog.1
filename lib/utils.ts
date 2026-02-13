import slugify from "slugify";

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function excerptFromHtml(html: string, maxChars = 180): string {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > maxChars ? `${text.slice(0, maxChars - 3)}...` : text;
}
