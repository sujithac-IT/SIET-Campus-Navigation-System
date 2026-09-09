# 🛡️ Security & Privacy Architecture

## OWASP Top 10 Safeguards

1. **Password Hashing**: Argon2id with strict memory and time cost settings (`$argon2id$v=19...`). Plaintext passwords are never logged or stored.
2. **Session Cookies**: Session identifiers are stored exclusively in `HttpOnly`, `SameSite=Lax`, `Secure` cookies. No JWTs in `localStorage`.
3. **Role-Based Access Control (RBAC)**: Fine-grained permissions (e.g. `facilities.read`, `events.create`, `timetable.update`, `emergency.broadcast`) checked per request.
4. **Input Validation**: Strict schema enforcement using Zod and Next.js request validation.
5. **Privacy Safeguards**: Faculty exact GPS coordinates are NEVER broadcast to students. Maximum default granularity is restricted to `ON CAMPUS`, `OFF CAMPUS`, or `BUILDING LEVEL`.
6. **Audit Logging**: Data modifications (room reassignments, user role changes, announcements, emergency SOS dispatches) write immutable entries to `audit_logs`.
