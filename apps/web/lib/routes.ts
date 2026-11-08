import { NAV, type NavDoc, type NavSection } from '@gorosary/content';

export interface RouteMatch {
  section: NavSection;
  /** The document at this path, when one exists. */
  doc?: NavDoc;
}

function buildRoutes(): Map<string, RouteMatch> {
  const map = new Map<string, RouteMatch>();
  for (const section of NAV) {
    for (const doc of section.docs) {
      map.set(doc.href, { section, doc });
    }
    if (!map.has(section.href)) {
      map.set(section.href, { section });
    }
  }
  return map;
}

const routes = buildRoutes();

/**
 * Paths served by a route of their own rather than by the content catch-all.
 * These are dynamic — the readings change with the day — so they cannot be
 * prerendered with the rest.
 */
const STANDALONE_ROUTES = new Set(['/search', '/readings']);

export function matchPath(path: string): RouteMatch | undefined {
  const clean = `/${path.replace(/^\/+|\/+$/g, '')}`;
  return routes.get(clean);
}

/** Every navigable path, used for static generation and the sitemap. */
export function allPaths(): string[] {
  return [...routes.keys()].filter(
    (href) => href !== '/' && !STANDALONE_ROUTES.has(href),
  );
}

/** The documents belonging to a section, in navigation order. */
export function docsInSection(section: NavSection): NavDoc[] {
  return section.docs;
}
