MangroveCoin
Impact → Tokens → Microcredit, built on Base
MangroveCoin is a Web3 MVP that rewards verified real-world activities with tokenized incentives and microcredit access.

Features
Wallet-based authentication
Activity creation & approval
Tokenized rewards (simulated / on-chain)
Microcredit issuance
Admin & user dashboards
Base-compatible architecture

How It Works
1. Connect Wallet
Users connect a wallet to access the platform.
The wallet acts as the user’s identity.

2. Create Activity
Users submit an activity (e.g. environmental or community action).
Status: PENDING
Reward: 10 tokens (default)

3. Admin Verification
An admin reviews and approves the activity.
Status changes → APPROVED

4. Earn Tokens
Approved activities mint reward tokens (currently simulated, moving on-chain).

5. Exchange for Microcredit
Users exchange earned tokens for microcredits tied to their wallet.

Tech Stack
Frontend: Next.js (App Router)
Backend: AWS Lambda + API Gateway
Database: DynamoDB
Blockchain: Base (Ethereum L2)
Auth: Wallet-based (no passwords)


Local Development
Prerequisites
Node.js 18+
Serverless Framework
AWS credentials (or serverless-offline)
Install
npm install
Run Frontend
npm run dev
Run Backend (offline)
serverless offline

Environment Variables
NEXT_PUBLIC_API_URL=YOUR_API_GATEWAY_URL
NEXT_PUBLIC_CONTRACT_ADDRESS=...
NEXT_PUBLIC_CHAIN_ID=8453


Roadmap
Deploy contracts on Base mainnet
Replace scans with DynamoDB GSIs
On-chain token minting
Pilot with real community groups

Contributing
This project is early-stage and experimental.
 Issues, PRs, and feedback are welcome.

License
MIT

