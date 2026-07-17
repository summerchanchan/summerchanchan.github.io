# Summer's World

Xiayu “Summer” Chen's interactive personal website: a bright, game-inspired
world with an observatory, a story house, a photography journal, a mailbox, and
RUMI, a Shiba Inu mental well-being companion.

- Live site: <https://summers-world-xiayu.summersummerchen.chatgpt.site>
- GitHub Pages address: <https://summerchanchan.github.io>
- The `master` branch keeps the GitHub Pages handoff page.
- The `summer-world-source` branch contains the full application source.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

The hosted RUMI endpoint requires server-side `OPENAI_API_KEY` and
`OPENAI_MODEL` environment variables. Never commit API keys to this repository.

## Project Shape

- `app/page.tsx`: interactive world and cottage rooms
- `app/api/rumi/route.ts`: server-side OpenAI Responses API integration
- `app/globals.css`: responsive visual design and motion
- `public/`: world art, RUMI, portrait, and photography assets

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: run the project checks
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Privacy and Safety

RUMI offers general mental well-being support, not diagnosis or therapy. The
server route includes crisis-language handling, bounded message history, short
responses, and basic per-visitor request limiting.
