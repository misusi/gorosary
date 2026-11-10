'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV } from '@gorosary/content';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('gorosary-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    } else {
      setTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      );
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('gorosary-theme', next);
  };

  return { theme, toggle };
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // A tap outside the menu closes it, as a menu should.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.menu-panel') || target.closest('.menu-button')) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // The section a page belongs to — either the section's own landing page, or
  // one of its documents.
  const currentSection = NAV.find(
    (section) =>
      section.href === pathname ||
      section.docs.some((doc) => doc.href === pathname),
  )?.id;

  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link href="/" className="brand">
          <span>GoRosary</span>
          <span className="brand__dot" aria-hidden="true" />
        </Link>

        <nav className="nav" aria-label="Sections">
          {NAV.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="nav__link"
              aria-current={currentSection === section.id ? 'page' : undefined}
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <Link href="/search" className="icon-button" aria-label="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <button
            type="button"
            className="icon-button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {theme === 'dark' ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
                </>
              ) : (
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              )}
            </svg>
          </button>
          <button
            type="button"
            className="icon-button menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="menu-panel">
          {NAV.map((section) => {
            const isExpanded = expanded === section.id;
            return (
              <div className="menu-panel__section" key={section.id}>
                <button
                  type="button"
                  className="menu-panel__heading"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : section.id)}
                >
                  {section.label} <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded ? (
                  <ul className="menu-panel__items">
                    {section.docs.map((doc) => (
                      <li key={doc.href}>
                        <Link
                          href={doc.href}
                          aria-current={pathname === doc.href ? 'page' : undefined}
                        >
                          {doc.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
