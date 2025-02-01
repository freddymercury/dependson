# DependsOn

**DependsOn** is a Node.js tool written in TypeScript that scans a specified root directory (and its subdirectories) for JavaScript (.js) and TypeScript (.ts) files, extracts their import dependencies (supporting both ES6 imports and CommonJS `require` calls), and prints a list of these dependencies. It also allows you to ignore files or directories using flexible, comma-separated glob patterns.

## Features

- **Dependency Extraction:**  
  Extracts module specifiers from both ES6-style `import` statements and CommonJS `require()` calls.

- **Custom Ignore Patterns:**  
  Accepts a comma-separated list of wildcard patterns (with support for single `*` and double `**`) to ignore files.  
  - Single asterisk (`*`): Matches any sequence of characters except for the path separator (`/`).  
  - Double asterisk (`**`): Matches any sequence of characters including `/`.  
  - Ignore patterns are applied to both the full file path and the file’s basename.

- **Pure Functions & Unit Tests:**  
  Core logic is implemented using pure functions with comprehensive unit tests to verify behavior and catch regressions.

- **Out-of-the-box Execution:**  
  Run the tool directly using `ts-node` with npm scripts, without needing a separate build step.

## Requirements

- **Node.js:** Version 14 or later is recommended.
- **TypeScript:** The project uses TypeScript, and it is configured to compile to CommonJS.
- **ts-node:** Used to run the TypeScript code directly.

## Installation

1. **Clone the repository or copy the project files.**

2. **Install the dependencies:**

   ```bash
   npm install --save-dev typescript ts-node @types/node


## Sample Output
```

> dependson@1.0.0 start
> ts-node index.ts ../eliza/agent **/node_modules/**, **/jest*, *test*

File: ../eliza/agent/src/index.ts
Dependencies:
  @elizaos/adapter-pglite
  @elizaos/adapter-postgres
  @elizaos/adapter-redis
  @elizaos/adapter-sqlite
  @elizaos/adapter-supabase
  @elizaos/client-auto
  @elizaos/client-discord
  @elizaos/client-farcaster
  @elizaos/client-lens
  @elizaos/client-slack
  @elizaos/client-telegram
  @elizaos/client-twitter
  @elizaos/plugin-reclaim
  @elizaos/client-direct
  @elizaos/plugin-primus
  @elizaos/core
  @elizaos/plugin-0g
  @elizaos/plugin-devschool
  ../userDataEvaluator
  ../userDataProvider
  @elizaos/plugin-bootstrap
  @elizaos/plugin-goat
  @elizaos/plugin-intiface
  @elizaos/plugin-3d-generation
  @elizaos/plugin-abstract
  @elizaos/plugin-allora
  @elizaos/plugin-aptos
  @elizaos/plugin-arthera
  @elizaos/plugin-avail
  @elizaos/plugin-avalanche
  @elizaos/plugin-binance
  @elizaos/plugin-coinbase
  @elizaos/plugin-coinmarketcap
  @elizaos/plugin-coingecko
  @elizaos/plugin-conflux
  @elizaos/plugin-cosmos
  @elizaos/plugin-cronoszkevm
  @elizaos/plugin-echochambers
  @elizaos/plugin-evm
  @elizaos/plugin-flow
  @elizaos/plugin-fuel
  @elizaos/plugin-genlayer
  @elizaos/plugin-image-generation
  @elizaos/plugin-lensNetwork
  @elizaos/plugin-multiversx
  @elizaos/plugin-near
  @elizaos/plugin-nft-generation
  @elizaos/plugin-node
  @elizaos/plugin-obsidian
  @elizaos/plugin-sgx
  @elizaos/plugin-solana
  @elizaos/plugin-solana-agentkit
  @elizaos/plugin-autonome
  @elizaos/plugin-story
  @elizaos/plugin-sui
  @elizaos/plugin-tee
  @elizaos/plugin-tee-log
  @elizaos/plugin-tee-marlin
  @elizaos/plugin-ton
  @elizaos/plugin-web-search
  @elizaos/plugin-giphy
  @elizaos/plugin-letzai
  @elizaos/plugin-thirdweb
  @elizaos/plugin-hyperliquid
  @elizaos/plugin-zksync-era
  @elizaos/plugin-opacity
  @elizaos/plugin-open-weather
  @elizaos/plugin-stargaze
  @elizaos/plugin-akash
  @elizaos/plugin-quai
  better-sqlite3
  fs
  net
  path
  url
  yargs
  @elizaos/plugin-dominos
--------------------
File: ../eliza/agent/userDataEvaluator.ts
Dependencies:
  @elizaos/core
--------------------
File: ../eliza/agent/userDataProvider.ts
Dependencies:
  @elizaos/core
--------------------
```
