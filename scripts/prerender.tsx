import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import HomePublic from '../client/components/home-public'
import About from '../client/components/about'
import ContactUs from '../client/components/contactus'
import Marketing from '../client/components/marketing'
import Footer from '../client/components/footer'
export { siteSchema } from '../client/security/site-schema'

const components = { '/': HomePublic, '/about': About, '/contactUs': ContactUs, '/marketing': Marketing }
export function render(path: keyof typeof components) {
  const Page = components[path]
  return renderToString(<MemoryRouter initialEntries={[path]}><Page /><Footer /></MemoryRouter>)
}
