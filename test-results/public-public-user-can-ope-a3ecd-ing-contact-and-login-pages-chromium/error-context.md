# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public.spec.ts >> public user can open home, marketing, contact and login pages
- Location: client/tests/e2e/public.spec.ts:3:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Contact', exact: true }) resolved to 2 elements:
    1) <a class="" href="/contactUs" data-discover="true">Contact</a> aka getByRole('navigation').getByRole('link', { name: 'Contact' })
    2) <a href="/contactus" data-discover="true" class="text-decoration-none text-dark">Contact</a> aka getByRole('contentinfo').getByRole('link', { name: 'Contact' })

Call log:
  - waiting for getByRole('link', { name: 'Contact', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - link "SAMCT Villages logo SAMCT Villages" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "SAMCT Villages logo" [ref=e6]
        - generic [ref=e7]: SAMCT Villages
      - generic [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "About" [ref=e10] [cursor=pointer]:
          - /url: /about
        - link "Marketing" [ref=e11] [cursor=pointer]:
          - /url: /marketing
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contactUs
        - link "Login" [ref=e13] [cursor=pointer]:
          - /url: /login
        - link "Register" [ref=e14] [cursor=pointer]:
          - /url: /register
  - main [ref=e15]:
    - generic [ref=e16]:
      - paragraph [ref=e17]: SAMCT Villages
      - heading "Safe, supportive village living in South Auckland and beyond" [level=3] [ref=e18]
      - paragraph [ref=e19]: Explore available village units, photos, and information for Ngatea, and Whitianga.
      - generic [ref=e20]:
        - link "Contact SAMCT" [ref=e21] [cursor=pointer]:
          - /url: /contactUs
        - link "View Available Units" [ref=e22] [cursor=pointer]:
          - /url: "#marketing-listings"
    - generic [ref=e24]:
      - button "All" [ref=e25] [cursor=pointer]
      - button "Ngatea" [ref=e26] [cursor=pointer]
      - button "Whitianga" [ref=e27] [cursor=pointer]
    - generic [ref=e30]: No marketing listings available yet.
  - contentinfo [ref=e31]:
    - generic [ref=e32]:
      - generic [ref=e33]:
        - generic [ref=e34]:
          - heading "SAMCT Villages" [level=5] [ref=e35]
          - paragraph [ref=e36]: South Auckland Masonic Charitable Trust providing community-focused retirement living and secure portal access for residents and administration.
        - generic [ref=e37]:
          - heading "Quick Links" [level=6] [ref=e38]
          - list [ref=e39]:
            - listitem [ref=e40]:
              - link "Home" [ref=e41] [cursor=pointer]:
                - /url: /
            - listitem [ref=e42]:
              - link "Login" [ref=e43] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e44]:
              - link "Contact" [ref=e45] [cursor=pointer]:
                - /url: /contactus
        - generic [ref=e46]:
          - heading "Locations" [level=6] [ref=e47]
          - list [ref=e48]:
            - listitem [ref=e49]: Ngatea
            - listitem [ref=e50]: Whitianga
      - separator [ref=e51]
      - generic [ref=e52]:
        - paragraph [ref=e53]: © 2026 SAMCT Villages. All rights reserved.
        - paragraph [ref=e54]: Built for SAMCT portal and public website
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('public user can open home, marketing, contact and login pages', async ({ page }) => {
  4  |   await page.goto('/')
  5  | 
  6  |   await expect(page.getByText('SAMCT Villages').first()).toBeVisible()
  7  | 
  8  |   await page.getByRole('link', { name: 'Marketing', exact: true }).click()
  9  |   await expect(page).toHaveURL(/marketing/)
  10 |   await expect(page.getByText(/Safe, supportive village living/i)).toBeVisible()
  11 | 
> 12 |   await page.getByRole('link', { name: 'Contact', exact: true }).click()
     |                                                                  ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Contact', exact: true }) resolved to 2 elements:
  13 |   await expect(page).toHaveURL(/contactUs/)
  14 |   await expect(page.getByText(/Get in touch/i)).toBeVisible()
  15 | 
  16 |   await page.getByRole('link', { name: 'Login', exact: true }).click()
  17 |   await expect(page).toHaveURL(/login/)
  18 |   await expect(page.getByText(/Welcome to SAMCT Portal/i)).toBeVisible()
  19 | })
```