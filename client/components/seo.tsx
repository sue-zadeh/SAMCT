import { useEffect } from 'react'

type SeoProps = {
  title: string
  description: string
  path: string
  noIndex?: boolean
}

const siteUrl = (
  import.meta.env.VITE_PUBLIC_SITE_URL || 'https://samctvillages.co.nz'
).replace(/\/$/, '')

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value))
}

export default function Seo({ title, description, path, noIndex = false }: SeoProps) {
  useEffect(() => {
    const canonicalUrl = `${siteUrl}${path === '/' ? '' : path}`
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex,nofollow' : 'index,follow',
    })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
  }, [description, noIndex, path, title])

  return null
}
