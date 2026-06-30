# Schrebergarten Council — Claude Code Context

A browser-based AI council app for Schrebergarten gardeners. A user types a question; 6 stakeholder agents (non-human and human voices) each respond via Anthropic API calls routed through a Next.js API route. A Fig Tree moderator then synthesises all voices. Built as a thesis prototype.

---

## Architecture

```
Browser (React client)
  → /api/council (Next.js server route)
    → Anthropic API (claude-sonnet-4-6)
```

**Auth:** Cookie-based password gate. `app/page.tsx` checks `sc_session` cookie against `ACCESS_PASSWORD` env var. Unauthenticated users are redirected to `/login`.

**No database.** All state is in-memory per session.

---

## Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Server component — auth check, renders `<CouncilPage />` |
| `components/CouncilPage.tsx` | Main "use client" page — all UI state, council run loop |
| `app/login/page.tsx` | Password form — uses `window.location.href` (not router) after auth |
| `app/api/auth/route.ts` | POST — validates password, sets `sc_session` HttpOnly cookie |
| `app/api/council/route.ts` | POST — proxies requests to Anthropic API using server-side key |
| `lib/agents.ts` | Agent configs + system prompts + background knowledge |
| `lib/api.ts` | `callOpening`, `callAgent`, `callModerator` — fetch wrappers |
| `lib/speech.ts` | Web Speech API — voice configs, `speak()`, `unlockSpeech()` |
| `lib/types.ts` | `AgentId`, `AgentResponse`, `AgentConfig` types |
| `lib/i18n.ts` | EN/DE translation strings — `translations[lang]` |
| `components/CouncilCircle.tsx` | SVG circle of agents — selection + deliberation modes |

---

## The 7 Agents

| ID | Name | Voice character |
|---|---|---|
| `pollinator` | Pollinator | Bees, butterflies — bright feminine, pitch 1.5 |
| `soil` | Soil | Microbes, worms — deep, slow, pitch 0.55 |
| `hedgehog` | Hedgehog | Garden animals — warm, slightly quick, pitch 1.25 |
| `snail` | Snail | Pest species / coexistence — low, deliberate, pitch 0.75 |
| `biodiversity` | Biodiversity | Edge species, native plants — mid feminine, pitch 1.2 |
| `neighbor` | Neighbor | Adjacent plot holders — low masculine, pitch 0.72 |
| `moderator` | Fig Tree | Synthesiser — elder feminine, pitch 1.05 |

System prompts and background knowledge live in `lib/agents.ts`. Each agent has a `systemPrompt` string with:
- Persona / voice description
- Core concerns (bullet list)
- `## Background knowledge` section with research facts (added per agent as needed)

**To improve an agent:** add facts to its `## Background knowledge` section in `lib/agents.ts`. Use an `IMPORTANT:` instruction if Claude needs to prioritise specific rules over general training knowledge (see Neighbor agent for example).

---

## Adding Knowledge to Agents

Paste research / rule summaries here and they get added to the relevant agent's `systemPrompt`. Claude draws on them for every question without needing them in the user prompt.

**Currently grounded agents:**
- **Hedgehog** — Swiss Braunbrustigel research (biology, habitat, dangers, feeding, hedgehog house)
- **Neighbor** — Gartenordnung Stadt Zürich GOZ (March 2022) + FGVA Betriebsreglement

---

## Voice Configuration

Voices are in `lib/speech.ts` → `AGENT_VOICE_CONFIG`. Each agent has:
- `pitch` (0–2, 1 = normal)
- `rate` (0.1–10, 1 = normal)
- `preferredNames` — EN voice names tried in order (Windows/Edge first, Chrome fallback)
- `preferredNamesDE` — DE voice names tried in order

**iOS fix:** `unlockSpeech()` must be called synchronously inside the button tap handler before any `await`. `speak()` has `onerror` + duration-based timeout fallback because iOS often doesn't fire `onend`.

---

## Language Support

Toggle between EN and DE in the header. Language is persisted in `localStorage("sc_lang")`.

- **UI strings:** `lib/i18n.ts` → `translations[lang]`
- **Agent responses:** `LANG_DIRECTIVE` appended to system prompts in `lib/api.ts`
- **Voices:** filtered by `v.lang.startsWith("de")` when `lang === "de"`

---

## Dev Workflow

```bash
npm run dev        # starts at http://localhost:3000 (also 0.0.0.0 for local network)
npm run build      # production build — run before pushing to catch errors
```

**Required:** `.env.local` in project root (not in git):
```
ANTHROPIC_API_KEY=sk-ant-api03-...
ACCESS_PASSWORD=Hard_89_Schrebergarten
```

---

## Deployment

- **Host:** Vercel, connected to GitHub repo `Chnebi0711/schrebergarten-council`
- **Branch:** `main` → auto-deploys on every push
- **Framework preset:** must be set to `Next.js` in Vercel project settings
- **Env vars:** set `ANTHROPIC_API_KEY` and `ACCESS_PASSWORD` in Vercel → Settings → Environment Variables

Push workflow:
```bash
git add <files>
git commit -m "description"
git push origin main   # Vercel deploys automatically
```

---

## Auth Flow

1. User visits `/` → `app/page.tsx` (server component) checks `sc_session` cookie
2. No valid cookie → `redirect("/login")`
3. User submits password → `POST /api/auth` → sets HttpOnly cookie → `window.location.href = "/"`
4. Hard navigation commits cookie before next request (avoids race with `router.replace`)

No middleware — auth is handled entirely in `app/page.tsx` (avoids Next.js 16 Edge runtime issues).

---

## Model

`claude-sonnet-4-6` via `/api/council`. Max tokens: 400 per agent, 600 for moderator opening, 800 for synthesis.
