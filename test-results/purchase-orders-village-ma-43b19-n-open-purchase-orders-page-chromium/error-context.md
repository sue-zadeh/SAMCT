# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-orders.spec.ts >> village manager can open purchase orders page
- Location: client/tests/e2e/purchase-orders.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#username')

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
    - generic [ref=e18]:
      - heading "Welcome to SAMCT Portal" [level=3] [ref=e19]
      - heading "Login" [level=2] [ref=e20]
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - img [ref=e24]
            - text: Username
          - textbox [ref=e26]
        - generic [ref=e27]:
          - generic [ref=e28]:
            - img [ref=e29]
            - text: Password
          - generic [ref=e31]:
            - textbox [ref=e32]
            - button [ref=e33] [cursor=pointer]:
              - img [ref=e34]
        - generic [ref=e36]:
          - checkbox "Remember Me" [ref=e37]
          - generic [ref=e38]: Remember Me
        - button "Login" [ref=e39] [cursor=pointer]
        - link "Forgot Password?" [ref=e41] [cursor=pointer]:
          - /url: /forgot-password
  - contentinfo [ref=e42]:
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - heading "SAMCT Villages" [level=5] [ref=e46]
          - paragraph [ref=e47]: South Auckland Masonic Charitable Trust providing community-focused retirement living and secure portal access for residents and administration.
        - generic [ref=e48]:
          - heading "Quick Links" [level=6] [ref=e49]
          - list [ref=e50]:
            - listitem [ref=e51]:
              - link "Home" [ref=e52] [cursor=pointer]:
                - /url: /
            - listitem [ref=e53]:
              - link "Login" [ref=e54] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e55]:
              - link "Contact" [ref=e56] [cursor=pointer]:
                - /url: /contactus
        - generic [ref=e57]:
          - heading "Locations" [level=6] [ref=e58]
          - list [ref=e59]:
            - listitem [ref=e60]: Ngatea
            - listitem [ref=e61]: Whitianga
      - separator [ref=e62]
      - generic [ref=e63]:
        - paragraph [ref=e64]: © 2026 SAMCT Villages. All rights reserved.
        - paragraph [ref=e65]: Built for SAMCT portal and public website
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('village manager can open purchase orders page', async ({ page }) => {
  4  |   await page.goto('/login')
  5  | 
> 6  |   await page.locator('#username').fill('village1')
     |                                   ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  7  |   await page.locator('#password').fill('123Suezx@')
  8  |   await page.getByRole('button', { name: /^login$/i }).click()
  9  | 
  10 |   await expect(page).toHaveURL(/village-manager/)
  11 | 
  12 |   await page.getByRole('link', { name: /Purchase Orders/i }).click()
  13 |   await expect(page).toHaveURL(/village-manager\/purchase-orders/)
  14 |   await expect(page.getByText(/Purchase Orders/i).first()).toBeVisible()
  15 | })
```