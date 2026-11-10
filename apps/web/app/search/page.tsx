import type { Metadata } from 'next';
import Link from 'next/link';
import { findNavDoc, getDoc, searchDocs } from '@gorosary/content';
import { SearchField } from '@/components/SearchField';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Find any prayer, novena, litany, or mystery in GoRosary.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? '').trim();
  const results = query ? searchDocs(query, 40) : [];

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <p className="eyebrow">Search</p>
          <h1 className="page-title">Find a prayer</h1>
          <p className="page-summary">
            Search every prayer, novena, litany, and mystery in the app.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 28 }}>
        <form action="/search" method="get" role="search">
          <label className="sr-only" htmlFor="q">
            Search GoRosary
          </label>
          <SearchField value={query} />
        </form>

        {query ? (
          <p className="muted" style={{ marginTop: 22 }}>
            {results.length === 0
              ? `Nothing found for “${query}”.`
              : `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”.`}
          </p>
        ) : null}

        {results.length > 0 ? (
          <div className="card-grid">
            {results.map((doc) => (
              <ResultCard key={doc.id} id={doc.id} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

function ResultCard({ id }: { id: string }) {
  const doc = getDoc(id);
  const nav = findNavDoc(id);
  if (!doc) return null;

  return (
    <Link className="card" href={nav?.href ?? '/'}>
      <p className="card__title">{doc.title}</p>
      <p className="card__desc">{doc.summary ?? doc.subtitle ?? ''}</p>
    </Link>
  );
}
