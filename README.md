
# Aenzbi Blockchain Interface

Aenzbi is a sophisticated, web-based interface for a simulated blockchain network. It provides a comprehensive suite of tools for users to monitor network activity, manage a personal wallet, explore blocks and transactions, deploy decentralized applications (DApps), and oversee an AI-powered network maintenance system.

The entire application is built using modern Angular, featuring a reactive, signal-based architecture and a sleek, responsive UI powered by Tailwind CSS.

## Key Features

### 1. Network Dashboard
A real-time overview of the blockchain's health and activity.
- **Live Stats:** View the current block height, total transactions, and number of deployed assets.
- **Latest Blocks:** A continuously updated list of the most recently mined blocks.
- **Latest Transactions:** A live feed of the newest transactions occurring on the network.

### 2. Wallet
A personal wallet for managing AENZ coin balances and assets.
- **View Balance & Address:** Clear display of your current AENZ balance and unique wallet address.
- **Send Funds:** An intuitive form to send AENZ to any other address on the network.
- **Transaction History:** A detailed log of all incoming and outgoing transactions related to your wallet.
- **Generate New Wallet:** Functionality to create a fresh wallet address.

### 3. Block Explorer
A powerful tool for inspecting the blockchain's history.
- **Comprehensive Search:** Find any block (by height or hash) or transaction (by hash).
- **Tabbed Views:** Easily switch between viewing all blocks and all transactions on the network in paginated tables.
- **Detailed Results:** The search provides a detailed breakdown of the queried block or transaction.

### 4. DApp Hub
A dedicated section for creating and managing on-chain assets and smart contracts.
- **Create Fungible Tokens (AENZ-20):** Mint your own cryptocurrency with a specified name, symbol, and total supply.
- **Create NFT Collections (AENZ-721):** Launch a new collection of non-fungible tokens.
- **Deploy Smart Contracts:** Deploy a mock contract by providing its ABI in JSON format.
- **Manage Deployed Assets:** View all your created tokens and NFTs. For tokens, you can mint additional supply directly from the UI.
- **Asset Detail View:** Click on any deployed asset to see its specific details and transaction history.

### 5. AI Blockchain Maintainer
An advanced, autonomous system that monitors and optimizes the network.
- **Live Monitoring:** Displays key metrics like Transactions Per Second (TPS) and the current network-wide gas price.
- **Dynamic Gas Fees:** The AI autonomously adjusts the gas price based on network congestion to ensure stability.
- **Network Status Indicator:** A visual dashboard showing the network's current health (e.g., Optimal, Congested, Critical).
- **AI Controls:** Toggle the AI's autonomous mode or trigger a manual diagnostic scan.
- **Event Log:** A real-time log of every observation, decision, and action taken by the AI maintainer.

## Technology Stack

- **Framework:** Angular (v20+)
  - **Zoneless Change Detection:** For high-performance, fine-grained reactivity.
  - **Standalone Components:** For a modern, modular, and NgModule-free architecture.
  - **Signals:** Used extensively for reactive state management across the entire application.
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Routing:** Hash-based routing using `@angular/router`.

## Architectural Overview

The application is built around a core `BlockchainService` which simulates a live blockchain environment in the browser's memory.

- **`BlockchainService.ts`:** This is the heart of the simulation. It manages the state of blocks, transactions, user wallets, and deployed assets. It contains logic for mining new blocks at a set interval, generating mock transactions, processing user actions (like sending funds or creating assets), and calculating fees based on the dynamic gas price.

- **`AiMaintainerService.ts`:** This service runs in the background, periodically "scanning" the network state managed by the `BlockchainService`. It calculates metrics like TPS, determines the network's health, and adjusts the `gasPrice` signal within the `BlockchainService`. This demonstrates a decoupled, event-driven interaction between system components.

- **Components:** Each feature is encapsulated in its own standalone Angular component, promoting separation of concerns and reusability. Components react to state changes from the services using signals and computed signals, ensuring the UI is always in sync with the underlying blockchain state.
