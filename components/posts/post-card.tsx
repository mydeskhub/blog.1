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
};

export function PostCard({
  slug,
  title,
  excerpt,
  publishedAt,
  authorName,
  authorImage,
  blogTitle,
}: PostCardProps) {
  return (
    <article className="group border-b border-line py-5 last:border-0">
      <Link href={`/p/${slug}`} className="block">
        <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-1 text-sm text-muted line-clamp-2">{excerpt}</p>
        )}
      </Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <Avatar src={authorImage} name={authorName} size={20} />
        <span>{authorName ?? "Unknown"}</span>
        <span>in {blogTitle}</span>
        {publishedAt && (
          <>
            <span>&middot;</span>
            <span>{formatDate(publishedAt)}</span>
          </>
        )}
      </div>
    </article>
  );
}
