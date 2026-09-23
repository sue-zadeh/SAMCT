# Security

Please report security issues privately to the repository owner. Do not post resident data, passwords, cookies, reset links or uploaded files in a public issue.

See [docs/security-review.md](docs/security-review.md) for this review's findings and remaining release checks.

The application requires server authentication and checks role, village and record ownership. Browser route guards and `noindex` are additional controls; they do not grant or deny data access.

Run `npm run test:e2e` only against the disposable local database described in the README. The setup refuses remote database URLs. Tests change and delete fixture data.

Keep production passwords and SMTP credentials in the host's secret settings. Rotate any real credential that has appeared in Git history. Deleting the current file does not revoke a credential or remove older copies.
