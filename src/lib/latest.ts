import publications from '../data/publications.json';
import presentations from '../data/presentations.json';
import { getCollection, type CollectionEntry } from 'astro:content';

export type LatestPublication = (typeof publications.publications)[number];
export type LatestPresentation = (typeof presentations.presentations)[number];
export type LatestPost = CollectionEntry<'posts'> | null;

export interface Latest {
  latestPub: LatestPublication;
  latestPres: LatestPresentation;
  latestPost: LatestPost;
}

/**
 * Returns the most recent publication, presentation, and post for Home Latest 3 grid.
 *
 * - `publications.publications` is Scholar-sorted desc (most recent first).
 * - `presentations.presentations` is manually sorted desc in the seed JSON.
 * - Posts collection may be empty; `latestPost` is then `null`.
 */
export async function getLatest(lang: 'en' | 'ko' = 'en'): Promise<Latest> {
  const latestPub = publications.publications[0];
  const latestPres = presentations.presentations[0];

  const posts = await getCollection('posts', (p) => !p.data.draft && p.data.lang === lang);
  const sorted = posts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const latestPost: LatestPost = sorted.length > 0 ? sorted[0] : null;

  return { latestPub, latestPres, latestPost };
}
