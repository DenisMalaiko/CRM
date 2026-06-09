Test the API endpoint "$ARGUMENTS" against the local dev server.

1. Parse the argument: expect format like "GET /business" or "POST /auth/login {body}"
2. Build and run a `curl` command against `http://localhost:3000/api/$endpoint`
   - Add `Content-Type: application/json` header
   - Add `Authorization: Bearer <token>` if the route is protected (ask user for token if needed)
   - Include request body if provided
3. Show: HTTP status code, response body (formatted JSON), response time
4. Flag any issues: 4xx/5xx errors, missing fields, unexpected response shape
