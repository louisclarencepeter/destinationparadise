# Security Policy

## Supported Versions

This project is a continuously deployed web application. Only the latest production deployment at [yournexttriptoparadise.com](https://yournexttriptoparadise.com) is actively maintained and receives security updates.

| Version | Supported |
| ------- | --------- |
| Latest (main branch) | ✅ |
| Older commits / forks | ❌ |

## Reporting a Vulnerability

We take security seriously at Destination Paradise. If you discover a security vulnerability in this repository or the live site, please report it **privately** so we can address it before it is publicly disclosed.

### How to report

1. **GitHub Private Reporting (preferred):** Use GitHub's [private vulnerability reporting](https://github.com/louisclarencepeter/destinationparadise/security/advisories/new) to submit a confidential report directly to the maintainers.
2. **Email:** If you prefer, email the maintainer at the address listed on the GitHub profile.

Please **do not** open a public GitHub issue for security vulnerabilities.

### What to include

- A clear description of the vulnerability and its potential impact.
- Steps to reproduce the issue.
- Relevant URLs, screenshots, or proof-of-concept code.
- A suggested fix, if you have one.

## Response Timeline

| Stage | Timeframe |
| ----- | --------- |
| Initial acknowledgement | Within 48 hours |
| Status update | Within 7 days |
| Fix or mitigation | As soon as possible, typically within 14 days for critical issues |

## Scope

The following are **in scope**:

- The live site at [yournexttriptoparadise.com](https://yournexttriptoparadise.com).
- Public API endpoints and Netlify Functions.
- Contact, booking, newsletter, and store form handling.
- Unintentional exposure of API keys or other secrets.
- XSS, CSRF, open redirects, authentication, authorization, or injection vulnerabilities.

The following are **out of scope**:

- Vulnerabilities in third-party services; report those to the relevant vendor.
- Social-engineering attacks.
- Denial-of-service or traffic-flooding tests.

## Disclosure Policy

We follow a **coordinated disclosure** model. Once a fix is deployed, we will work with the reporter to agree on a disclosure timeline and credit them in the release notes if they wish.

Thank you for helping keep Destination Paradise and its users safe.
