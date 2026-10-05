import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import pages from './public-pages.json'
import { developer, siteSchema } from './site-schema'

export default function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = Object.keys(pages).find(path => path.toLowerCase() === (pathname.replace(/\/+$/, '') || '/').toLowerCase()) as keyof typeof pages | undefined
    const page = path ? pages[path] : undefined
    const title = page?.title || 'SAMCT Portal'
    const description = page?.description || 'Secure access to the SAMCT portal.'
    const site = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
    const indexable = !!page && import.meta.env.VITE_ALLOW_INDEXING === 'true' && !!site
    document.title = title
    const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.appendChild(element) }
      element.content = content
    }
    for (const [key, value] of Object.entries({ description, robots: indexable ? 'index, follow' : 'noindex, nofollow', author: developer, 'twitter:card': 'summary', 'twitter:title': title, 'twitter:description': description })) setMeta('name', key, value)
    for (const [key, value] of Object.entries({ 'og:title': title, 'og:description': description, 'og:image:alt': 'SAMCT Villages logo' })) setMeta('property', key, value)
    for (const selector of ['link[rel="canonical"]', 'meta[property="og:url"]', '#samct-structured-data', 'meta[property="og:image"]', 'meta[name="twitter:image"]']) document.querySelector(selector)?.remove()
    if (page && path && site) {
      const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = `${site}${path}`; document.head.appendChild(canonical)
      setMeta('property', 'og:url', canonical.href)
      setMeta('property', 'og:image', `${site}/social-logo.png`)
      setMeta('name', 'twitter:image', `${site}/social-logo.png`)
      const schema = document.createElement('script'); schema.id = 'samct-structured-data'; schema.type = 'application/ld+json'; schema.textContent = JSON.stringify(siteSchema(site, path, title, description)); document.head.appendChild(schema)
    }
  }, [pathname])
  return null
}
