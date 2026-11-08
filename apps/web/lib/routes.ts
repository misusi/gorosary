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

export function matchPath(path: string): RouteMatch | undefined {
  const clean = `/${path.replace(/^\/+|\/+$/g, '')}`;
  return routes.get(clean);
}

/** Every navigable path, used for static generation and the sitemap. */
export function allPaths(): string[] {
  return [...routes.keys()].filter((href) => href !== '/');
}

/** The documents belonging to a section, in navigation order. */
export function docsInSection(section: NavSection): NavDoc[] {
  return section.docs;
}
