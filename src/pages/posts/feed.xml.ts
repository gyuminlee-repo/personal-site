import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const all = await getCollection('posts', ({ data }) => !data.draft && data.lang === 'en');
  const posts = all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: 'Gyu Min Lee — Posts',
    description: 'Writing on synthetic biology, methanotroph engineering, and agentic tooling.',
    site: context.site ?? 'https://gyuminlee.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/posts/${post.slug}`,
      description: post.data.title,
      categories: post.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
