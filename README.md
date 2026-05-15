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

### Required for first run

Set this and the app boots:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_VENUE_ID` | Your venue ID on the OddMaki Protocol. Without it, the app shows a setup modal blocking everything else. |

### Required for production

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GRAPH_API_KEY` | The Graph gateway API key. Optional locally — the SDK falls back to the hosted Studio endpoint. See [Subgraph data](#subgraph-data) below. |

### Conditionally required

Only needed if you opt into the corresponding feature:

| Variable | Required when |
|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_ID` | `NEXT_PUBLIC_AUTH_PROVIDER=rainbowkit` (the default). Enables WalletConnect so mobile wallets can connect. Get one free at [cloud.reown.com](https://cloud.reown.com). |
| `NEXT_PUBLIC_PRIVY_APP_ID` | `NEXT_PUBLIC_AUTH_PROVIDER=privy` |
| `PINATA_JWT` | You enable image uploads when editing market metadata (server-side; consumed by `/api/ipfs/upload`) |

### Optional (with defaults)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | `8453` | `8453` (Base mainnet) or `84532` (Base Sepolia) |
| `NEXT_PUBLIC_VENUE_NAME` | `"OddMaki Markets"` | Display name |
| `NEXT_PUBLIC_AUTH_PROVIDER` | `rainbowkit` | `rainbowkit` or `privy` |
| `NEXT_PUBLIC_WS_RPC_URL` | _(unset)_ | WebSocket RPC URL for real-time event streaming. Without it, the app falls back to polling. |
| `NEXT_PUBLIC_IPFS_GATEWAY` | SDK default | Custom IPFS gateway for resolving market images and metadata |

### Subgraph data

This app reads market and trading data from the OddMaki subgraph on [The Graph](https://thegraph.com). The canonical Subgraph ID is bundled in the SDK — you don't configure it. What you *do* configure is your own API key:

- **Local development:** leave `NEXT_PUBLIC_GRAPH_API_KEY` unset. The SDK falls back to The Graph's hosted Studio endpoint, which is free and rate-limited but fine for development.
- **Production / staging:** set `NEXT_PUBLIC_GRAPH_API_KEY` to your own key. The SDK switches to the decentralized gateway, which has higher limits, better redundancy, and is what you should be paying for in production.

**How to get an API key (free, ~2 minutes):**

1. Go to [thegraph.com/studio](https://thegraph.com/studio) and connect a wallet.
2. Sidebar → **API Keys** → **Create API Key**.
3. Click into the new key. Under its security/settings, configure all three:
   - **Authorized Subgraphs** — paste the OddMaki Base mainnet Subgraph ID:
     ```
     QmPaESDtwZvtYPx8vvAU3nHE7kZBZ121XQCiPxM4bQauGh
     ```
     This is also exported from the SDK as `SUBGRAPH_IDS[base.id]`. Locking the key to this specific subgraph means it can't be reused against unrelated subgraphs if it ever leaks.
   - **Authorized Domains** — add your production domain(s) (e.g. `markets.example.com`). For preview deployments add `*.vercel.app` or similar. **Do not** add `localhost` here — create a separate key for local dev if you need the production query path locally.
   - **Spending limit** — set a monthly USD cap appropriate to your traffic. The first 100k queries/month are free; pay-as-you-go after that.
4. Copy the key into `NEXT_PUBLIC_GRAPH_API_KEY` in your hosting platform's environment variables (Vercel, Railway, etc.).

The key is exposed to the browser (it has to be — queries originate from the client). The subgraph allowlist + domain allowlist + spending cap are what keep it safe — a leaked key with all three set is largely useless to anyone else.

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

Only `primary` and `secondary` are required. Full shade scales and semantic tokens are auto-generated. Override `surfaces.background`, `surfaces.card`, and `surfaces.foreground` to customize backgrounds.

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Markets grid (home)
│   ├── market/[id]/             # Market detail
│   ├── market/multi/[id]/       # Market group detail
│   ├── leaderboard/             # Trader leaderboard
│   └── trader/[address]/        # Trader profile
├── components/                   # Shared UI (navbar, icons, theme)
├── config/                       # Venue settings, contracts, network
├── features/                     # Feature modules
│   ├── auth/                    # Pluggable auth (RainbowKit / Privy)
│   ├── venue/                   # Venue config check + read-only data
│   ├── wallet/                  # Balances, funding, approvals
│   ├── markets/                 # Market list grid
│   ├── market-detail/           # Market detail data + layout
│   ├── market-groups/           # Multi-outcome market group views
│   ├── price-market/            # Pyth price feed markets
│   ├── orderbook/               # Orderbook depth visualization
│   ├── trading/                 # Orders, positions, split/merge
│   ├── resolution/              # UMA oracle lifecycle
│   ├── access-control/          # Venue access control
│   ├── leaderboard/             # Trader rankings
│   ├── trader-profile/          # Trader stats + history
│   ├── price-chart/             # Price chart
│   └── realtime/                # Real-time data
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
