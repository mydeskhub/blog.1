import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

type PostCardProps = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | string | null;
  authorName: string | null;
  authorImage?: string | null;
  blogTitle: string;
  coverImageUrl?: string | null;
};

export function PostCard({
  slug,
  title,
  excerpt,
  publishedAt,
  authorName,
  authorImage,
  blogTitle,
  coverImageUrl,
}: PostCardProps) {
  return (
    <article className="group">
      <Link href={`/p/${slug}`} className="block">
        {coverImageUrl && (
          <div className="aspect-[16/10] overflow-hidden rounded-lg mb-4">
            <img
              src={coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            {blogTitle}
          </span>
          <h3 className="font-display text-xl font-bold leading-snug text-text transition-colors group-hover:text-accent">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm leading-relaxed text-muted line-clamp-2">{excerpt}</p>
          )}
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <Avatar src={authorImage} name={authorName} size={20} />
        <span className="font-medium text-text/70">{authorName ?? "Unknown"}</span>
        {publishedAt && (
          <>
            <span className="text-line">&middot;</span>
            <span>{formatDate(publishedAt)}</span>
          </>
        )}
      </div>
    </article>
  );
}
