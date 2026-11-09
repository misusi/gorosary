import Link from 'next/link';

/**
 * The credit for a borrowed picture.
 *
 * The paintings are the work of other people; the credit is small, it is
 * beside the picture, and it links to where the picture came from.
 */
export function ImageCredit({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <p className="small muted image-credit">
      Artwork from{' '}
      <Link href={href} rel="noopener noreferrer" target="_blank">
        {children}
      </Link>
    </p>
  );
}
