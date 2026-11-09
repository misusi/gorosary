# Deploying gorosary.app

How the website goes from this repository to the live domain. The pieces are
already built and tested; what is left is account configuration.

**The site is deployed.** The repository is on GitHub, the service is running
on Railway, and `gorosary.app` is attached to it. What is left is the DNS at
Porkbun — see [HANDOFF.md](../HANDOFF.md) §7 for the exact records, which
Railway issues when the domain is added.

**The stack:** GitHub holds the code, Railway builds and runs it, Porkbun
points the domain at it. SSL is issued automatically by Railway.

```
GitHub (github.com/misusi/gorosary)
        ↓  Railway builds on every push to main
Railway (runs the Next.js server)
        ↓  Porkbun DNS: ALIAS + TXT records
gorosary.app  (HTTPS, Let's Encrypt, renewed automatically)
```

**Follow the steps in order.** You cannot write the DNS records until Railway
gives you a target, and you do not want to point a live domain at a service
that has not been built yet — so verify the Railway-provided address works
before touching Porkbun.

---

## 1. Push to GitHub

The repository exists: `github.com/misusi/gorosary`, public, with `main` as
the branch. A new repository would be made from the project root with:

```bash
gh repo create gorosary --public --source=. --remote=origin --push \
  --description "GoRosary — the Rosary, novenas, and the prayers of the day."
```

Or with the GitHub web UI: create an empty repository called `gorosary`, then

```bash
git remote add origin https://github.com/misusi/gorosary.git
git push -u origin main
```

`railway.json` at the root tells Railway how to build and start the project, so
nothing else needs configuring:

- **Build:** `npm run build:packages && npm run build --workspace @gorosary/web`
- **Start:** `npm run start --workspace @gorosary/web -- --hostname 0.0.0.0`
- **Health check:** `/`

The start command binds `0.0.0.0` because Railway reaches the service from
outside the container, and it reads the `PORT` Railway sets automatically.

> **Deploying is not the same as pushing.** The repository is attached to the
> Railway service, but the Railway GitHub App is not installed on it, so a push
> does not trigger a build. Install the App on the repository, or deploy by
> hand:
>
> ```bash
> railway up --detach --service gorosary
> ```

---

## 2. Create the Railway project

In the Railway dashboard: **New Project → Deploy from GitHub Repo** → pick
`misusi/gorosary`.

Railway will detect the monorepo. Check that the service it created has:

| Setting | Value |
|---|---|
| Root directory | *(leave empty — the repo root)* |
| Build command | `npm run build:packages && npm run build --workspace @gorosary/web` |
| Start command | `npm run start --workspace @gorosary/web -- --hostname 0.0.0.0` |
| Healthcheck path | `/` |

If Railway's own GitHub integration offers to deploy on every push to `main`,
accept it — the site will then redeploy itself whenever you change a prayer.

> **The start command lives in the root `package.json`, not only in
> `railway.json`.** Railway's current builder (Railpack) does not read
> `deploy.startCommand` out of `railway.json` — it looks for a `start` script
> in the root `package.json`, and a monorepo root has none by default. The
> root `package.json` therefore carries the same command, so the site starts
> whether Railway reads the file or the script. Keep the two in step.

### Or from the command line

```bash
railway login
railway init --name gorosary
railway up --detach
```

`railway login` opens a browser, so run it yourself rather than in a script:

```
! railway login
```

### Generate a Railway domain first

Before wiring up the custom domain, confirm the service is healthy on its own
address. In the dashboard: **Service → Settings → Networking → Public
Networking → Generate Domain**. Railway gives a `*.up.railway.app` address.

Check that address in a browser. If it loads today's rosary, the build is good
and only DNS is left.

---

## 3. Add the custom domain in Railway

**Service → Settings → Networking → Custom Domains → Add Domain** → enter
`gorosary.app`.

Railway then shows you **two** records it needs:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `@` | e.g. `g05ns7.up.railway.app` |
| `TXT` | `_railway-verify` | `railway-verify=<a long hash>` |

**Both are required.** With only the CNAME, the domain resolves but returns
`404` — Railway checks the TXT record to confirm you actually own the domain
before it will route traffic to it.

> **The TXT value is the whole string, `railway-verify=` and the hash
> together — not the domain ID.** The domain ID that `railway domain status`
> prints is for identifying the domain to Railway; pasting it as the TXT
> value leaves the domain unverified, and Railway then serves a placeholder
> certificate, so the browser warns and `curl` fails with
> `SEC_E_WRONG_PRINCIPAL`.

The CLI prints both records along with the values it expects, so read them off
the output rather than guessing:

```bash
railway domain gorosary.app --service gorosary
railway domain status 7f4d235b-2383-48d6-8472-a63660999ed3
```

> The Trial plan allows **one** custom domain, so `gorosary.app` and
> `www.gorosary.app` count as two. See the note on `www` below.

---

## 4. Point the domain at Railway (Porkbun)

Porkbun supports CNAME flattening at the root, which is what an apex domain
needs — no move to Cloudflare. In the Porkbun panel: **Domain Management →
Details → Edit → DNS Records**.

**a. Delete the parking records first.** Porkbun adds default records for the
root and a `*` wildcard. An `ALIAS` record cannot coexist with them — delete
any `A`/`AAAA`/`CNAME` record for host `@`, and the `*` wildcard.

**b. Add the ALIAS record for the root.**

| Field | Value |
|---|---|
| Type | `ALIAS - CNAME flattening` |
| Host | *(blank — blank means the root domain)* |
| Answer | the CNAME target Railway gave you, e.g. `g05ns7.up.railway.app` |
| TTL | `600` |

**c. Add the TXT record for verification.**

| Field | Value |
|---|---|
| Type | `TXT` |
| Host | whatever Railway showed — `_railway-verify` |
| Answer | the `railway-verify=<hash>` string Railway gave you — the whole thing, not the domain ID |
| TTL | `600` |

**d. Add `www`.**

| Field | Value |
|---|---|
| Type | `CNAME` |
| Host | `www` |
| Answer | the same CNAME target Railway gave you |
| TTL | `600` |

For `www` to actually work it must also be registered as a custom domain on
the Railway service. The Railway **Trial plan allows only one** custom domain,
so `gorosary.app` and `www.gorosary.app` count as two. If your plan allows
only one, use Porkbun's **URL Forwarding** instead: *Domain Management → Details
→ Edit → URL Forwarding*, source `gorosary.app`, destination
`https://gorosary.app`. Delete the `*` wildcard CNAME record first — it
collides with the forward.

**Or use the Porkbun API** if you would rather script it. `packages/content`
does not need it, and the credentials are best kept out of the repository —
but the DNS changes are three records, so the panel is usually quicker.

---

## 5. Wait for the certificate

Railway issues a Let's Encrypt certificate automatically once it verifies the
TXT record. This usually happens within an hour of the DNS going live; it can
take a few minutes.

Check on **Service → Settings → Networking → Custom Domains** — the domain
should turn green.

Then:

```bash
curl -I https://gorosary.app
```

---

## 6. After it is live

- **Check `https://gorosary.app`** — the homepage should show today's rosary.
- **Check `http://gorosary.app`** — Railway redirects to HTTPS.
- **Check the health check** — Railway's health check path is `/`.

### Two things to know about "today"

- The website resolves "today" in the **server's** timezone. If the site is
  served from a region ahead of or behind you, the mystery set can be a few
  hours off at the edges of the day. The app is correct by construction.
- The mystery set changes at midnight by the liturgical calendar, not at a
  fixed hour. There is no cache to clear.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| `404` on the custom domain, CNAME resolves | The `TXT` verification record is missing or not yet propagated. |
| Certificate not issued | `TXT` record still propagating, or the `www` record is masking the apex. |
| Build fails with `No start command detected` | Railway's builder wants a `start` script in the **root** `package.json`, not only `deploy.startCommand` in `railway.json`. Add it and redeploy. |
| "Another next dev server is already running" | A dev server was left running locally. See `STARTUP.md`. |
| Build fails on Railway | The build needs dev dependencies — `typescript` and `tsx` are devDependencies and are installed during the build. Make sure the root directory is the repo root, not `apps/web`. |
| Port already in use locally | `npm run dev` now finds the next free port and says so. |
| `Config as Code (railway.json) is deprecated` | Railway is moving to Infrastructure as Code. See the note below. |

---

## 7. `railway.json` is deprecated

Railway has deprecated Config as Code (`railway.json`) in favour of
Infrastructure as Code (`.railway/railway.ts`). The file keeps working until
**1 December 2026**, after which it stops being read.

To migrate:

```bash
railway config migrate --apply --show   # writes .railway/railway.ts
railway config migrate cutover           # the service now reads the .ts file
railway config migrate --delete-files    # only after the cutover
```

The cutover is reversible with `railway config migrate undo`. Commit
`.railway/railway.ts` alongside the deletion of `railway.json` so the two never
disagree.

---

## Deploying the app (not the website)

The mobile app is a separate release: Expo → EAS Build → App Store and Play
Store. See `docs/ROADMAP.md`, Phase 4. It is not part of this deployment.
