import Link from 'next/link';
import { NAV } from '@gorosary/content';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__col">
            <p className="footer__title">GoRosary</p>
            <p className="small" style={{ maxWidth: '34ch' }}>
              The Rosary, the novenas, and the prayers of the day — in one place,
              on every device.
            </p>
          </div>

          {NAV.slice(0, 4).map((section) => (
            <div className="footer__col" key={section.id}>
              <p className="footer__title">{section.label}</p>
              <ul className="footer__list">
                {section.docs.slice(0, 5).map((doc) => (
                  <li key={doc.href}>
                    <Link href={doc.href}>{doc.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="footer__note">
          Prayer texts are traditional Catholic prayers in the public domain;
          Scripture references follow the Douay-Rheims. The mystery set for each
          day is computed from the Roman liturgical calendar — see{' '}
          <Link href="/calendar/how-the-mysteries-change">
            how the mysteries change
          </Link>
          . GoRosary is not affiliated with any religious order or diocese.
        </p>
      </div>
    </footer>
  );
}
