# Security Review

## Scope

This review covered the repository's source code, configuration, scripts, dependency-related files, and deployment-related files.

## Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | HIGH | [src/App.jsx](src/App.jsx) | 23-30, 56-58, 89-90 | Authentication and authorization are implemented entirely in client-side JavaScript and attacker-controlled `localStorage`. The application includes the publicly visible credential `admin12@mail.com` / `123`, restores any stored `role` without verification, and renders the admin dashboard based only on that role. An attacker can set `localStorage.setItem("loggedInUser", JSON.stringify({ role: "admin" }))` to obtain admin UI access. | 10/10 |
| 2 | HIGH | [src/utils/localStorage.jsx](src/utils/localStorage.jsx) | 6, 50, 84, 118, 152, 197-207 | Employee passwords and the administrator password are hardcoded in cleartext in frontend source and written to browser `localStorage`. Every employee uses the password `123`, and the complete employee/admin records are published to client storage. Anyone who can load the application can read these credentials and impersonate users. | 10/10 |

## Impact

The current frontend does not provide a trusted authentication or authorization boundary. Anyone with access to the application can obtain administrator UI access or employee credentials. If this frontend is connected to external services, client-side role checks and local data must not be used to protect those services.

## Recommended remediation

1. Move authentication and authorization to a trusted backend.
2. Store passwords only as secure, salted password hashes on the server.
3. Issue server-controlled, short-lived sessions or tokens and validate them server-side.
4. Authorize every protected operation on the server; never trust roles or identities from `localStorage`.
5. Remove credentials and authoritative employee/task data from the frontend bundle and browser storage.

## Malicious-code indicators

No evidence of intentionally malicious code was found. The review found no obfuscated payloads, credential exfiltration, suspicious network requests, dynamic code execution, or unauthorized third-party scripts.
