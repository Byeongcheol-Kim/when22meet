import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://when22meet.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date('2024-11-08'),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date('2024-11-08'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];
}