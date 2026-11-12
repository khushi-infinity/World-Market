# Emberhall

**The guild market of the seven realms.** A complete freelance marketplace where patrons post decrees, artisans swear oaths, and coin waits in the vault until the work is delivered.

Emberhall is a working product, not a mockup. It ships with a Spring Boot API, a React client, a seeded world, real escrow accounting, live ravens, PayPal sandbox checkout, and an AI counsel that can draft proposals and briefs.

---

## What is inside

- **Guild hall landing page** with bespoke SVG citadel artwork, a realm map, live hall statistics, featured decrees, and the six guild regions.
- **Job board** with search, region filters, budget and sort controls, and detailed decree pages.
- **Proposals and oaths**: artisans submit a proposal with a bid, timeline, and cover letter. Patrons accept one oath, which opens a contract and declines the rest.
- **Escrow contracts** with a full lifecycle: awaiting funding, funded, in progress, delivered, released, disputed, and cancelled.
- **Dual payment gateways**: PayPal Orders v2 through the official JS SDK, plus a Crown Ledger sandbox that works with no keys at all.
- **Real time ravens**: STOMP over WebSocket chat in every contract room, with live delivery, system notices, unread notice counts, and presence.
- **Presence**: in memory by default, Redis backed when enabled, so several server instances share who is online.
- **Treasury**: wallet balance, earnings, held coin, a signed ledger, and withdrawals.
- **Oracle**: Spring AI counsel powered by Groq through the OpenAI compatible endpoint, with a local fallback when no key is present.
- **Reputation**: artisan profiles, ratings, reviews, completed oaths, and response times.
- **Responsive design** with a parchment, ember, and iron design system, motion, toasts, empty states, and keyboard friendly controls.

## Stack

| Layer | Choice |
| --- | --- |
| API | Spring Boot 3.5.3, Java 22, Spring Security, Spring Data JPA, Spring WebSocket |
| AI | Spring AI 1.0.0 with the OpenAI starter pointed at Groq |
| Database | H2 file database by default, PostgreSQL profile included |
| Presence | Optional Redis with an in memory fallback |
| Auth | Stateless JWT with BCrypt password hashing |
| Client | React 19, Vite 6, TypeScript, Tailwind CSS 4 |
| Data | TanStack Query, React Router 7 |
| Motion | Framer Motion, Lucide icons, custom SVG art |

## Quick start

Requirements: **Java 22**, **Maven 3.9+**, **Node 20+**.

```bash
# 1. From the project root, create your local environment file.
cp .env.example .env

# 2. Start the API and the client together.
./scripts/dev.sh
```

Open **http://localhost:5173**. The API listens on **http://localhost:8080**.

The first run builds the server jar, installs client packages, seeds the world, and starts both processes. Stop everything with `Ctrl+C`.

### Run the two halves by hand

```bash
# API
cd server
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home mvn -DskipTests package
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home \
  java -jar target/guild-1.0.0.jar

# Client, in a second terminal
cd client
npm install
npm run dev
```

If your machine already defaults to Java 22, plain `mvn` and `java` are enough. The script detects the usual macOS JDK 22 location for you.

## Demo accounts

The seeder runs only when the database is empty. Both accounts use the password **`guildhall`**.

| Role | Email | What to try |
| --- | --- | --- |
| Patron | `patron@emberhall.io` | Post a decree, review proposals, fund escrow, release payment |
| Artisan | `artisan@emberhall.io` | Browse work, submit an oath, deliver, watch the wallet fill |

The hall also contains eleven additional artisans, a spread of open jobs, several live contracts, reviews, notifications, and raven threads so every screen has something real to show.

To reseed from scratch, stop the server and delete `server/data/`, then start again.

## Optional keys

Everything runs without paid services. These two keys unlock the full experience.

### Groq for the Oracle (free)

1. Create a key at https://console.groq.com.
2. Set `GROQ_API_KEY` in `.env`.
3. Restart the API.

Spring AI calls Groq through the OpenAI compatible base URL with `llama-3.3-70b-versatile` by default. Without a key, the Oracle answers from a local counsel engine and the UI labels it as the hall Oracle. The Oracle can draft a proposal, sharpen a brief, and answer questions about escrow, pricing, and delivery.

### PayPal sandbox (free)

1. Open https://developer.paypal.com/dashboard and create a sandbox app.
2. Copy the client ID and secret into `.env`:

```properties
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_MODE=sandbox
```

3. Restart the API. The contract room now renders real PayPal buttons.

The server creates an order with Orders v2, the browser approves it, and the server captures it. The client ID is served from `GET /api/config`; the secret never leaves the server.

Without keys, the same flow creates a simulated `SANDBOX-EH-...` order and marks the contract funded through the **Crown Ledger**, so the escrow lifecycle remains testable. The payment is still recorded with its gateway, so the ledger stays honest.

## How escrow works

```
proposal accepted
      |
      v
AWAITING_FUNDING -- fund via PayPal or Crown Ledger --> FUNDED
                                                        |
                                              artisan delivers
                                                        v
                                                    DELIVERED
                                                        |
                                              patron releases coin
                                                        v
                                                     RELEASED
```

- The patron funds the full contract amount up front. Coin is held by the hall.
- The artisan marks the work delivered with a note and optional link.
- On release, the artisan wallet is credited the amount minus the **10 percent guild tithe**. The patron can adjust the fee with `PLATFORM_FEE_PERCENT`.
- A patron can open a dispute instead of releasing. The contract becomes `DISPUTED` and the coin stays held.
- After release, the patron can leave a review. Ratings flow back into the artisan profile.
- Every movement writes a signed ledger entry visible in the Treasury.

## API overview

All routes are under `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Receive a JWT |
| GET | `/auth/me` | Current member |
| GET | `/public/stats` | Hall counters for the landing page |
| GET | `/public/featured-jobs` | Featured decrees |
| GET | `/config` | PayPal mode, client ID, fee, AI status |
| GET | `/jobs` | Search and filter the board |
| GET | `/jobs/{id}` | Decree detail |
| POST | `/jobs` | Post a decree |
| PATCH | `/jobs/{id}` | Edit your decree |
| DELETE | `/jobs/{id}` | Close your decree |
| GET | `/jobs/{id}/proposals` | Proposals for your decree |
| POST | `/jobs/{id}/proposals` | Submit an oath |
| POST | `/proposals/{id}/accept` | Accept an oath and open a contract |
| POST | `/proposals/{id}/withdraw` | Withdraw an oath |
| GET | `/my/jobs`, `/my/proposals` | Your side of the hall |
| GET | `/orders` | Your contracts |
| GET | `/orders/{id}` | Contract room detail |
| POST | `/orders/{id}/paypal/create` | Create a PayPal order |
| POST | `/orders/{id}/paypal/capture` | Capture and fund |
| POST | `/orders/{id}/crown/fund` | Fund through the Crown Ledger |
| POST | `/orders/{id}/deliver` | Mark work delivered |
| POST | `/orders/{id}/release` | Release escrow to the artisan |
| POST | `/orders/{id}/dispute` | Freeze the escrow |
| POST | `/orders/{id}/review` | Review a released contract |
| GET | `/wallet` | Balance, held coin, ledger |
| POST | `/wallet/withdraw` | Withdraw available coin |
| GET | `/conversations` | Raven threads |
| POST | `/conversations` | Open a thread |
| GET | `/conversations/{id}/messages` | Read a thread |
| POST | `/conversations/{id}/messages` | Send a raven |
| POST | `/presence/ping` | Mark yourself online |
| GET | `/presence/online` | Online member ids |
| GET | `/artisans` | Browse the guild |
| GET | `/artisans/{handle}` | Artisan profile |
| GET | `/artisans/{handle}/reviews` | Reviews |
| PATCH | `/users/me` | Update profile and preferences |
| GET | `/dashboard` | Patron and artisan summary |
| GET | `/notifications` | Hall notices |
| POST | `/notifications/read-all` | Clear unread notices |
| POST | `/ai/counsel` | Ask the Oracle |
| POST | `/ai/proposal` | Draft a proposal |
| POST | `/ai/brief` | Draft a decree brief |

`GET /api/health` and `/actuator/health` are open for probes.

### WebSocket

- Endpoint: `/ws` (native WebSocket, no SockJS)
- Subscribe: `/topic/conversations/{contractId}`
- Messages are sent through the REST endpoint above, which persists the raven and then broadcasts it, so a dropped socket never loses a message.
- Presence pings run every 25 seconds from the client. The presence window is 75 seconds.

## Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| `GROQ_API_KEY` | empty | Enables live Oracle answers |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | OpenAI compatible endpoint |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Any Groq chat model |
| `PAYPAL_CLIENT_ID` | empty | Sandbox or live app client ID |
| `PAYPAL_CLIENT_SECRET` | empty | Server only |
| `PAYPAL_MODE` | `sandbox` | `sandbox` or `live` |
| `PAYPAL_CURRENCY` | `USD` | Escrow currency |
| `PLATFORM_FEE_PERCENT` | `10` | Guild tithe on release |
| `JWT_SECRET` | development value | Change in production |
| `SERVER_PORT` | `8080` | API port |
| `CORS_ORIGINS` | local client origins | Comma separated |
| `SEED_DATA` | `true` | Set `false` for an empty hall |
| `DATABASE_URL` | H2 file URL | JDBC URL |
| `DATABASE_USER` | `sa` | Database user |
| `DATABASE_PASSWORD` | empty | Database password |
| `DATABASE_DRIVER` | `org.h2.Driver` | `org.postgresql.Driver` for PostgreSQL |
| `REDIS_ENABLED` | `false` | Share presence across instances |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

Spring reads `.env` from the project root and from `server/` automatically. Environment variables set in your shell take precedence.

## PostgreSQL and Redis

Both are optional. Start them with Docker:

```bash
docker compose up -d
```

Then run the API with the PostgreSQL profile and Redis presence:

```bash
cd server
SPRING_PROFILES_ACTIVE=postgres REDIS_ENABLED=true \
  DATABASE_URL=jdbc:postgresql://localhost:5432/emberhall \
  DATABASE_USER=emberhall DATABASE_PASSWORD=emberhall \
  JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home \
  java -jar target/guild-1.0.0.jar
```

The compose file creates database `emberhall` with user and password `emberhall`, and a Redis instance on `6379`. The PostgreSQL profile lives in `server/src/main/resources/application-postgres.yml`. The H2 console stays available at `/h2-console` when H2 is in use.

## Project structure

```
The World/
  .env.example              Environment template
  docker-compose.yml        Optional PostgreSQL and Redis
  scripts/dev.sh            One command to run both halves
  server/
    pom.xml                 Spring Boot build
    src/main/java/io/emberhall/guild/
      config/               Security, WebSocket, seed data
      domain/               JPA entities and enums
      dto/                  Request and response records
      repo/                 Spring Data repositories
      security/             JWT filter, token service, current user
      service/              Auth, jobs, proposals, contracts, PayPal,
                            chat, presence, AI, stats, notifications
      web/                  REST controllers and error handling
    src/main/resources/
      application.yml       Base configuration
      application-postgres.yml
  client/
    src/components/         Layout, cards, Oracle, PayPal seal, SVG art
    src/lib/                API client, auth, realtime, presence, types
    src/pages/              Landing, jobs, contracts, messages, treasury,
                            settings, oracle, oath, auth
    src/index.css           Design system and theme
```

## Scripts

| Command | What it does |
| --- | --- |
| `./scripts/dev.sh` | Build if needed, run API and client together |
| `npm --prefix client run dev` | Client only on port 5173 |
| `npm --prefix client run build` | Typecheck and produce `client/dist` |
| `npm --prefix client run typecheck` | TypeScript only |
| `npm --prefix client run preview` | Serve the production build |
| `mvn -f server/pom.xml -DskipTests package` | Build the API jar |
| `mvn -f server/pom.xml test` | Run API tests |

## Design notes

- The theme is a guild hall, not a generic dashboard: decrees, oaths, ravens, sigils, regions, and a vault.
- Copy avoids em dashes and en dashes throughout the product and the seed content.
- The interface uses Cinzel for headings, Cormorant Garamond for prose, and Inter for controls, over parchment, ember, and iron tokens.
- All artwork is hand built SVG, including the citadel hero, the realm map, and the sigil avatars, so the project has no external image dependencies.
- Motion is used for arrival and emphasis, never to block a task. Every flow also works with reduced motion.
- The contract room is the center of gravity: escrow state, payment, delivery, release, dispute, review, terms, and the full chronicle in one place.

## Troubleshooting

**The API exits with a Java version error.** Build and run with Java 22. On macOS:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-22.jdk/Contents/Home
```

**The seed data does not appear.** The seeder only runs on an empty database. Stop the API, delete `server/data/`, and start again.

**PayPal buttons do not render.** Confirm both `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set and the API was restarted. Check `GET /api/config` for `paypalConfigured: true`.

**The Oracle gives short local answers.** `GROQ_API_KEY` is missing or invalid. Check `GET /api/config` for `aiLive: true`.

**Ports are busy.** Change `SERVER_PORT`, or stop the process using `8080` or `5173`. The client proxy in `client/vite.config.ts` points at `8080` by default.

**Presence looks stale.** The client pings every 25 seconds and the window is 75 seconds. With Redis enabled, confirm Redis is reachable and that `REDIS_ENABLED=true` was set before startup.

---

Built for the hall. May your oaths hold and your coin return.
