# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in QuoteCraft, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email us at **security@quotecraft.dev** with:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Potential impact assessment
4. Any suggested fixes (optional)

### What to Expect

- **Acknowledgment:** We will acknowledge receipt within 48 hours.
- **Assessment:** We will assess the severity and impact within 5 business days.
- **Fix:** Critical vulnerabilities will be patched within 7 days. High severity within 14 days.
- **Disclosure:** We will coordinate disclosure with you after a fix is released.

### Scope

The following are in scope for security reports:

- Authentication and authorization bypasses
- Cross-site scripting (XSS)
- SQL injection
- Path traversal
- Insecure direct object references
- Payment processing vulnerabilities
- E-signature forgery or bypass
- Data exposure or leakage

### Out of Scope

- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report these upstream)
- Issues requiring physical access to a user's device

## Security Best Practices for Self-Hosting

When deploying QuoteCraft, ensure:

1. **HTTPS:** Always use HTTPS in production.
2. **Environment Variables:** Never commit `.env` files. Use secrets management.
3. **Database:** Use strong passwords and restrict network access.
4. **Updates:** Keep dependencies updated regularly.
5. **Backups:** Maintain regular database backups.
