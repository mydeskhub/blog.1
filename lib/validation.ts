import { z } from "zod";

export const createPostSchema = z.object({
  blogId: z.string().cuid(),
  title: z.string().min(3).max(160),
  content: z.any(),
  htmlContent: z.string().optional(),
  excerpt: z.string().max(240).optional(),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().min(1).max(32)).max(10).default([]),
  status: z
    .enum(["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT"),
});

export const updatePostSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  content: z.any().optional(),
  htmlContent: z.string().optional(),
  excerpt: z.string().max(240).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().cuid().nullable().optional(),
  tags: z.array(z.string().min(1).max(32)).max(10).optional(),
  status: z
    .enum(["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED", "ARCHIVED"])
    .optional(),
  summary: z.string().max(200).optional(),
});

export const commentSchema = z.object({
  postId: z.string().cuid(),
  body: z.string().min(1).max(2000),
  parentId: z.string().cuid().optional(),
});

export const clapSchema = z.object({
  postId: z.string().cuid(),
  count: z.number().int().min(1).max(50).default(1),
});

export const createTeamSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
});

export const aiSuggestionSchema = z.object({
  mode: z.enum(["rephrase", "tone", "grammar", "outline", "expand"]),
  selection: z.string().min(1).max(4000),
  articleTitle: z.string().max(200).optional(),
  tone: z.string().max(60).optional(),
  targetLength: z.number().int().positive().max(4000).optional(),
});
