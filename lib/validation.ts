import { z } from "zod";

export const createArticleSchema = z.object({
  blogId: z.string().cuid(),
  title: z.string().min(3).max(160),
  content: z.any(),
  htmlContent: z.string().optional(),
  excerpt: z.string().max(240).optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().min(1).max(32)).max(10).default([]),
  status: z
    .enum(["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT")
});

export const aiSuggestionSchema = z.object({
  mode: z.enum(["rephrase", "tone", "grammar", "outline", "expand"]),
  selection: z.string().min(1).max(4000),
  articleTitle: z.string().max(200).optional(),
  tone: z.string().max(60).optional(),
  targetLength: z.number().int().positive().max(4000).optional()
});
