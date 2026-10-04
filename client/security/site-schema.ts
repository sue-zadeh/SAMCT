export const developer = 'Sue Raisianzadeh | Freelance Web Developer | suewebstudio'
export function siteSchema(site: string, path: string, title: string, description: string) {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': `${site}/#organization`, name: 'South Auckland Masonic Charitable Trust', alternateName: 'SAMCT', url: `${site}/`, logo: `${site}/social-logo.png` },
    { '@type': 'Organization', '@id': 'https://suewebstudio.com/#studio', name: 'suewebstudio', url: 'https://suewebstudio.com/' },
    { '@type': 'Person', '@id': 'https://suewebstudio.com/#sue-raisianzadeh', name: 'Sue Raisianzadeh', jobTitle: 'Freelance Web Developer', url: 'https://suewebstudio.com/', worksFor: { '@id': 'https://suewebstudio.com/#studio' } },
    { '@type': 'WebSite', '@id': `${site}/#website`, name: 'SAMCT Villages', url: `${site}/`, inLanguage: 'en-NZ', publisher: { '@id': `${site}/#organization` }, creator: { '@id': 'https://suewebstudio.com/#sue-raisianzadeh' } },
    { '@type': path === '/contactUs' ? 'ContactPage' : path === '/about' ? 'AboutPage' : 'WebPage', '@id': `${site}${path}#webpage`, url: `${site}${path}`, name: title, description, inLanguage: 'en-NZ', isPartOf: { '@id': `${site}/#website` }, about: { '@id': `${site}/#organization` } }
  ] }
}
