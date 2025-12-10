import { apiGet } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annapurnahospital.com';

export default async function sitemap() {
  const urls = [
    { url: `${siteUrl}/`, lastModified: new Date() },
    { url: `${siteUrl}/departments`, lastModified: new Date() },
    { url: `${siteUrl}/doctors`, lastModified: new Date() },
    { url: `${siteUrl}/pack`, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    { url: `${siteUrl}/gallery`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
  ];

  try {
    const [depRes, docRes, pkgRes, blogRes] = await Promise.all([
      apiGet('/departments'),
      apiGet('/doctors'),
      apiGet('/packages'),
      apiGet('/blogs'),
    ]);

    depRes?.data?.forEach((d) => {
      urls.push({ url: `${siteUrl}/departments/${d.slug}`, lastModified: new Date() });
    });

    docRes?.data?.forEach((d) => {
      urls.push({ url: `${siteUrl}/doctors/${d.slug}`, lastModified: new Date() });
    });

    pkgRes?.data?.forEach((p) => {
      urls.push({ url: `${siteUrl}/pack/${p.slug}`, lastModified: new Date() });
    });

    blogRes?.data
      ?.filter((b) => b.status === 'published')
      .forEach((b) => {
        urls.push({ url: `${siteUrl}/blog/${b.slug}`, lastModified: new Date() });
      });
  } catch (error) {
    // If fetching fails, return base URLs only
  }

  return urls;
}
