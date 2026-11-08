import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDoc } from '@gorosary/content';
import { allPaths, matchPath } from '@/lib/routes';
import { DocumentView } from '@/components/DocumentView';
import { InlineText } from '@/components/Blocks';

export const dynamicParams = false;

export function generateStaticParams() {
  return allPaths().map((href) => ({
    path: href.replace(/^\//, '').split('/').filter(Boolean),
  }));
}

type PageProps = {
  params: Promise<{ path?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path } = await params;
  const match = matchPath((path ?? []).join('/'));
  if (!match) return { title: 'Not found' };

  const doc = match.doc?.docId ? getDoc(match.doc.docId) : undefined;
  const title = doc?.title ?? match.section.label;
  const description = doc?.summary ?? match.section.description;

  return {
    title,
    description,
    alternates: { canonical: match.doc?.href ?? match.section.href },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { path } = await params;
  const match = matchPath((path ?? []).join('/'));
  if (!match) notFound();

  const { section, doc: navDoc } = match;
  const doc = navDoc?.docId ? getDoc(navDoc.docId) : undefined;

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={section.href}>{section.label}</Link>
            {doc ? (
              <>
                <span aria-hidden="true">/</span>
                <span>{doc.title}</span>
              </>
            ) : null}
          </nav>

          <p className="eyebrow">{section.label}</p>
          <h1 className="page-title">{doc?.title ?? section.label}</h1>
          {doc?.subtitle ? (
            <p className="page-subtitle">{doc.subtitle}</p>
          ) : (
            <p className="page-subtitle">{section.description}</p>
          )}
          {doc?.summary ? <p className="page-summary">{doc.summary}</p> : null}
        </div>
      </div>

      <div className="wrap with-aside">
        <div>
          {doc ? (
            <DocumentView doc={doc} />
          ) : (
            <SectionIndex section={section} />
          )}
        </div>

        <aside className="aside">
          <div className="aside__group">
            <p className="aside__title">{section.label}</p>
            <ul className="aside__list">
              {section.docs.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={entry.href === (navDoc?.href ?? '') ? 'page' : undefined}
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="aside__group">
            <p className="aside__title">Everywhere</p>
            <ul className="aside__list">
              <li>
                <Link href="/">Today</Link>
              </li>
              <li>
                <Link href="/search">Search</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function SectionIndex({
  section,
}: {
  section: import('@gorosary/content').NavSection;
}) {
  return (
    <>
      <p className="prose" style={{ marginBottom: 8 }}>
        <InlineText text={section.description} />
      </p>
      <div className="card-grid">
        {section.docs.map((entry) => (
          <Link className="card" key={entry.href} href={entry.href}>
            <p className="card__title">{entry.label}</p>
            {entry.description ? (
              <p className="card__desc">{entry.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </>
  );
}
