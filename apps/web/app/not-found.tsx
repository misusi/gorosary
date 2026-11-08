import Link from 'next/link';
import { NAV } from '@gorosary/content';

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">Not found</p>
      <h1 className="page-title">That prayer is not here</h1>
      <p className="page-summary">
        The page you asked for does not exist. Here is everything that is.
      </p>

      <div className="card-grid">
        {NAV.map((section) => (
          <Link className="card" key={section.id} href={section.href}>
            <p className="card__title">{section.label}</p>
            <p className="card__desc">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
