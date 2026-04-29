# OddMaki Venue Starter

A white-label prediction market frontend for the [OddMaki Protocol](https://github.com/oddmaki/oddmaki-core). Clone this repo, set your venue ID, customize the branding, and deploy your own prediction market platform.

OddMaki is a permissionless prediction market factory — anyone can launch a venue with custom rules for market creation, trading, fees, and access control. This starter gives you a production-ready frontend out of the box.

## Quick Start

```bash
pnpm install
cp .env.local.example .env.local   # set your venue ID
pnpm dev                            # http://localhost:3000
```

## Stack

- **Next.js 15** (App Router)
- **HeroUI** + **Tailwind CSS v4** for UI
- **wagmi** + **RainbowKit** for wallet connection
- **TanStack Query** for data fetching
- **OddMaki SDK** (`@oddmaki-protocol/sdk`) for all protocol interactions
- **sonner** for notifications

## Features

Everything a venue operator needs to run a prediction market platform:

- **Market browsing** — Grid view with pricing, volume, and status
- **Market detail** — Orderbook, price chart, positions, and order management
- **Trading** — Limit orders, market orders (FOK/FAK), split/merge, batch operations
- **Market creation** — Binary markets, market groups, and Pyth price markets
- **Resolution** — Full UMA oracle lifecycle (assert, settle, report, redeem)
- **Market groups** — Multi-outcome bundles with shared collateral
- **Access control** — Whitelist, NFT-gated, and token-gated venue management
- **Leaderboard** — Trader rankings by volume, P&L, and trade count
- **Trader profiles** — Position history, P&L tracking, activity feed
- **Theming** — Two-color brand config auto-generates a full design system
- **Real-time updates** — Live orderbook data

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_VENUE_ID` | Yes | Your venue ID on the OddMaki Protocol |
| `NEXT_PUBLIC_SUBGRAPH_URL` | Yes | Subgraph GraphQL endpoint |
| `NEXT_PUBLIC_VENUE_NAME` | No | Display name (default: `"OddMaki Markets"`) |
| `NEXT_PUBLIC_AUTH_PROVIDER` | No | `rainbowkit` or `privy` (default: `rainbowkit`) |
| `NEXT_PUBLIC_PRIVY_APP_ID` | No | Required if using Privy auth |
| `NEXT_PUBLIC_ENABLE_MARKET_CREATION` | No | Enable market creation UI |
| `NEXT_PUBLIC_ENABLE_THEME_EDITOR` | No | Enable theme editor at `/admin/theme` |
| `PINATA_JWT` | No | Pinata JWT for IPFS uploads (server-side) |

## Theming

Brand colors in `theme.config.json`:

```json
{
  "brand": {
    "primary": "#00F0FF",
    "secondary": "#FF00E5"
  }
}
```

Only `primary` and `secondary` are required. Full shade scales, surface colors, and semantic tokens are auto-generated. Set `NEXT_PUBLIC_ENABLE_THEME_EDITOR=true` and visit `/admin/theme` for a live preview editor.

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Markets grid (home)
│   ├── market/[id]/             # Market detail
│   ├── market/multi/[id]/       # Market group detail
│   ├── leaderboard/             # Trader leaderboard
│   ├── trader/[address]/        # Trader profile
│   └── admin/theme/             # Theme editor
├── components/                   # Shared UI (navbar, icons, theme)
├── config/                       # Venue settings, contracts, network
├── features/                     # Feature modules
│   ├── auth/                    # Pluggable auth (RainbowKit / Privy)
│   ├── venue/                   # Venue setup + management
│   ├── wallet/                  # Balances, funding, approvals
│   ├── markets/                 # Market list grid
│   ├── market-creation/         # Create market form
│   ├── market-detail/           # Market detail data + layout
│   ├── market-groups/           # Multi-outcome market groups
│   ├── price-market/            # Pyth price feed markets
│   ├── orderbook/               # Orderbook depth visualization
│   ├── trading/                 # Orders, positions, split/merge
│   ├── resolution/              # UMA oracle lifecycle
│   ├── access-control/          # Venue access control
│   ├── leaderboard/             # Trader rankings
│   ├── trader-profile/          # Trader stats + history
│   ├── price-chart/             # Price chart
│   ├── realtime/                # Real-time data
│   └── theme-editor/            # Theme editor
├── lib/                          # Utilities
│   ├── oddmaki/                 # SDK hooks, transaction utils, query keys
│   ├── theme/                   # Color generation, theme resolution
│   └── ipfs/                    # IPFS upload helpers
├── styles/                       # Global CSS
├── hero.ts                       # HeroUI plugin config
└── theme.config.json             # Brand colors (customize this)
```

Each feature module follows the same pattern: `hooks/` for data, `components/` for UI, `index.ts` for barrel exports.

## Commands

```bash
pnpm dev        # Dev server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # ESLint
```

## Deployment

Standard Next.js deployment. Set the required environment variables in your platform (Vercel, Railway, etc.) and run `pnpm build`.

## Related

- [oddmaki-core](https://github.com/oddmaki/oddmaki-core) — Smart contracts (BUSL-1.1)
- [oddmaki-sdk](https://github.com/oddmaki/oddmaki-sdk) — TypeScript SDK
- [oddmaki-subgraph](https://github.com/oddmaki/oddmaki-subgraph) — Subgraph

## Links

- **Protocol** — [oddmaki.com](https://oddmaki.com)
- **Maintainer** — [predictablereality.com](https://predictablereality.com)
- **Contact** — team@oddmaki.com

## License

[MIT](./LICENSE) — fork it, brand it, ship it. Copyright (c) 2025-2026 Predictable Reality, Inc.
