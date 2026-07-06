import { createFileRoute } from '@tanstack/react-router'

import { getSettings } from '../lib/data.server'

const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/gallery', priority: '0.7', changefreq: 'weekly', galleryOnly: true },
  { path: '/faq', priority: '0.7', changefreq: 'monthly', faqOnly: true },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/shipping-refunds', priority: '0.3', changefreq: 'yearly' },
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const today = new Date().toISOString().split('T')[0]
        // The FAQ page is listed only while the owner has it set public.
        const settings = await getSettings()
        const faqPublic = settings.faq_public === '1'
        const galleryPublic = settings.show_gallery === '1'
        const urls = ROUTES.filter(
          (r) => (faqPublic || !r.faqOnly) && (galleryPublic || !r.galleryOnly),
        )
          .map(
            (r) => `  <url>
    <loc>${origin}${r.path === '/' ? '' : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
          )
          .join('\n')
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          urls,
          '</urlset>',
        ].join('\n')
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
