import React from "react";

// ---------------------------------------------------------------------------
// Base URL helpers
// ---------------------------------------------------------------------------

export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export function canonicalUrl(path: string): string {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

// ---------------------------------------------------------------------------
// JSON-LD component
// ---------------------------------------------------------------------------

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  });
}

// ---------------------------------------------------------------------------
// Article schema
// ---------------------------------------------------------------------------

interface ArticleInput {
  title: string;
  excerpt?: string | null;
  htmlContent?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  slug: string;
}

interface AuthorInput {
  name?: string | null;
  image?: string | null;
}

export function generateArticleJsonLd(
  post: ArticleInput,
  author: AuthorInput,
) {
  const wordCount = post.htmlContent
    ? post.htmlContent.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean)
        .length
    : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.coverImageUrl && { image: post.coverImageUrl }),
    ...(post.publishedAt && {
      datePublished: new Date(post.publishedAt).toISOString(),
    }),
    ...(post.updatedAt && {
      dateModified: new Date(post.updatedAt).toISOString(),
    }),
    wordCount,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl(`/p/${post.slug}`),
    },
    author: {
      "@type": "Person",
      name: author.name ?? "Unknown",
      ...(author.image && { image: author.image }),
    },
    publisher: {
      "@type": "Organization",
      name: "BlogSaaS",
      ...(getBaseUrl() !== "http://localhost:3000" && {
        url: getBaseUrl(),
      }),
    },
  };
}

// ---------------------------------------------------------------------------
// Breadcrumb schema
// ---------------------------------------------------------------------------

interface BreadcrumbItem {
  name: string;
  url?: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ schema (auto-detected from HTML)
// ---------------------------------------------------------------------------

interface FaqEntry {
  question: string;
  answer: string;
}

export function extractFaqFromHtml(html: string): FaqEntry[] | null {
  // Split on h2/h3/h4 tags, keeping the headings
  const parts = html.split(/(<h[234][^>]*>.*?<\/h[234]>)/i);
  const faqs: FaqEntry[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const headingHtml = parts[i];
    const contentHtml = parts[i + 1];
    if (!headingHtml || !contentHtml) continue;

    // Extract heading text
    const headingText = headingHtml.replace(/<[^>]*>/g, "").trim();
    if (!headingText.endsWith("?")) continue;

    // Strip tags from the answer
    const answerText = contentHtml.replace(/<[^>]*>/g, "").trim();
    if (answerText.length < 20) continue;

    faqs.push({ question: headingText, answer: answerText });
  }

  return faqs.length > 0 ? faqs : null;
}

export function generateFaqJsonLd(html: string) {
  const faqs = extractFaqFromHtml(html);
  if (!faqs) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
