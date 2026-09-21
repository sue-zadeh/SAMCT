import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pages: Record<string, { title: string; description: string }> = {
  '/': { title: 'SAMCT Villages | Ngatea and Whitianga', description: 'Learn about South Auckland Masonic Charitable Trust villages in Ngatea and Whitianga, explore available homes and contact the SAMCT team.' },
  '/about': { title: 'About SAMCT | South Auckland Masonic Charitable Trust', description: 'Find out about South Auckland Masonic Charitable Trust and its village communities in Ngatea and Whitianga.' },
  '/marketing': { title: 'Available Village Homes | SAMCT Villages', description: 'Explore published village homes, photos and information for SAMCT communities in Ngatea and Whitianga.' },
  '/contactUs': { title: 'Contact SAMCT Villages', description: 'Contact the SAMCT team to ask about its villages, available homes and resident services.' },
}
export default function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const page = pages[pathname]
    const title = page?.title || 'SAMCT Portal'
    const description = page?.description || 'Secure access to the SAMCT portal.'
    const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
    const indexable = !!page && import.meta.env.VITE_ALLOW_INDEXING === 'true' && !!siteUrl
    document.title = title
    for (const [name, content] of Object.entries({ description, robots: indexable ? 'index, follow' : 'noindex, nofollow', author: 'Sue Raisianzadeh | Freelance Web Developer | suewebstudio' })) {
      let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      if (!element) { element = document.createElement('meta'); element.name = name; document.head.appendChild(element) }
      element.content = content
    }
    for (const [property, content] of Object.entries({ 'og:title': title, 'og:description': description })) {
      const element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (element) element.content = content
    }
    document.querySelector('link[rel="canonical"]')?.remove()
    document.querySelector('meta[property="og:url"]')?.remove()
    if (page && siteUrl) {
      const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = `${siteUrl}${pathname}`; document.head.appendChild(canonical)
      const socialUrl = document.createElement('meta'); socialUrl.setAttribute('property', 'og:url'); socialUrl.content = canonical.href; document.head.appendChild(socialUrl)
    }
  }, [pathname])
  return null
}
