type PostContentProps = {
  htmlContent: string | null;
};

export function PostContent({ htmlContent }: PostContentProps) {
  if (!htmlContent) {
    return <p className="text-muted italic">No content available.</p>;
  }

  return (
    <div
      className="prose-medium"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
