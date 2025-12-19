# Copilot / AI agent instructions for 202510_lab1

Purpose: short, actionable guide so AI coding agents become productive immediately.

1) Big picture
- This is a tiny static single-page application (井字遊戲) served by Nginx inside a container.
- Static assets live under `app/` (`index.html`, `script.js`, `style.css`).
- Container image is defined by `Dockerfile` and CI publishes images to GitHub Container Registry and GitHub Pages via `.github/workflows/secure-pipeline.yml`.

2) Key files to read first
- `app/index.html`, `app/script.js`, `app/style.css` — UI and game logic. Look for DOM patterns and event handlers.
- `Dockerfile` — shows how files are copied to `/usr/share/nginx/html` and Nginx is configured to listen on port 8080.
- `docker-compose.yml` — runtime service config; note it references a GHCR image (no local `build:` block).
- `nginx.conf` — routing (`try_files`) and security headers used in production.
- `.github/workflows/secure-pipeline.yml` — CI does heavy security scanning (Semgrep, Trivy, Gitleaks) and will build/push images and deploy to Pages.

3) How to run and reproduce locally
- Build image locally (recommended):
  - `docker build -t 202510_lab1:local .`
  - `docker run --rm -p 8080:8080 202510_lab1:local`
- Alternative: tag as GHCR image name used in `docker-compose.yml` for parity with compose:
  - `docker build -t ghcr.io/<owner>/<repo>:latest .`
  - then `docker-compose up` will use that image without changing the file.
- The app listens on container port `8080` (mapped to host `8080` in compose).

4) Project-specific patterns & conventions
- Pure static site: there are no dependency manifests (no `package.json` etc.). CI conditionally skips SCA when none exist.
- Nginx is configured to serve SPA routes via `try_files $uri $uri/ /index.html` — prefer in-place client routing fixes.
- Container is deliberately run on non-privileged port 8080 in Dockerfile (not 80).

5) Integration & CI expectations (important for PRs)
- CI runs Semgrep (rulesets: `p/security-audit`, `p/secrets`, `p/owasp-top-ten`). Fix findings or justify false positives in PR description.
- CI will build and scan Docker images with Trivy; follow `Dockerfile` best practices (small base, no secrets, minimal layers).
- Gitleaks is enabled — remove any hardcoded secrets before committing.

6) Known hotspots you should inspect/edit (concrete examples)
- `app/script.js` contains multiple security anti-patterns that CI will flag and must be remediated:
  - `evaluateUserInput()` uses `eval()` — avoid or sandbox; replace with explicit parsing.
  - `statusDisplay.innerHTML = ...` — XSS risk; prefer `textContent` or sanitized injection.
  - `setTimeout('computerMove()', userInput)` — passing code string; use `setTimeout(computerMove, Number(userInput))` and validate input.
  - Hard-coded secrets present: `API_KEY` and `DATABASE_URL` in `app/script.js` — remove and move to secure storage if needed.
  - Risky regex `new RegExp('(a+)+$')` — potential ReDoS; make deterministic or limit input length.

7) What to do when creating code changes
- Keep changes minimal and focused; update only files required for the fix.
- When addressing security warnings: include which CI job flagged the issue and a short justification in the PR description if you believe it's a false positive.
- Add tests only when they are small and runnable locally (this repo does not include a test harness by default).

8) Helpful commands summary
- Build & run locally:
  - `docker build -t 202510_lab1:local .`
  - `docker run --rm -p 8080:8080 202510_lab1:local`
- Build image with GHCR tag (to match `docker-compose.yml`):
  - `docker build -t ghcr.io/<owner>/<repo>:latest .`

9) When to ask the user
- If a Semgrep or Trivy finding requires product-level decisions (e.g., removing a feature), ask for clarification before major refactors.
- If you need credentials or a deployment token, request them out-of-band — do not create or commit secrets in the repo.

If any section is unclear or you'd like me to include example PR descriptions, say so and I'll iterate.
