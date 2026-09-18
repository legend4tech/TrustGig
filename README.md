# 🚀 TrustGig

TrustGig is a decentralized, Web3-powered freelance marketplace designed to eliminate middleman fees and guarantee payment security for both clients and freelancers. By leveraging **Stellar Soroban Smart Contracts** and the **Trustless Work Escrow** protocol, TrustGig ensures that funds are locked securely and released only when milestones are successfully completed.

## 🌟 How It Works

1. **Gig Creation**: Clients create a gig by specifying the scope of work, budget (in USDC), and deadline.
2. **Freelancer Application**: Freelancers browse available gigs and submit their proposals/applications.
3. **Smart Contract Escrow**: Once a client approves a freelancer's application, a Soroban smart contract is dynamically deployed via Trustless Work.
4. **Funding**: The client signs a Stellar transaction to fund the escrow with the gig's budget plus a minimal 0.3% protocol fee.
5. **Work & Approval**: The freelancer submits their final work. The client reviews the submission and approves it.
6. **Fund Release**: Approval triggers the smart contract to immediately release the exact budget amount directly to the freelancer's wallet.

## 🌐 Network Information

### Current State (Testnet)
TrustGig is currently deployed and running on the **Stellar Testnet**.
- All transactions, escrow deployments, and funding events use Testnet XLM and Testnet USDC.
- We utilize the **Pollar Indexer** (`@pollar/react`) for wallet connection (Freighter) and blockchain reads.
- Smart contracts are handled seamlessly by the `@trustless-work/escrow` SDK.

### Expected Behavior on Mainnet
When migrating to **Stellar Mainnet**, the core logic remains identical. The only required changes will be:
- Pointing the Trustless Work SDK to the production API endpoint.
- Updating the `trustline` token address to the official Stellar USDC issuer.
- Users will need real XLM (for gas) and real USDC in their Freighter wallets.
- Transactions will reflect real-world financial value with instant, low-fee settlements.

## 💻 How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB instance (Local or Atlas)
- Freighter Wallet browser extension (Set to Stellar Testnet)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd trust-gig
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   MONGODB_URI=mongodb+srv://<your-db-connection-string>
   NEXTAUTH_SECRET=<your-nextauth-secret>
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-secret>
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗺️ Project Navigation

The codebase is built on **Next.js 14** using the App Router. Here is a quick guide to finding your way around:

- **`src/app/`**: Contains all the page routes.
  - **`/auth`**: Login, Signup, and NextAuth configuration.
  - **`/dashboard/client`**: Client-specific views (Gig creation, reviewing applicants, funding escrow, approving work).
  - **`/dashboard/freelancer`**: Freelancer-specific views (Browsing gigs, submitting applications, delivering work).
  - **`/api`**: Backend serverless endpoints handling MongoDB CRUD operations and file uploads.
- **`src/components/`**: Reusable UI components (buttons, forms, dialogs) largely utilizing Tailwind CSS and Radix UI.
- **`src/models/`**: Mongoose schemas defining our database structure (`User`, `Gig`, `Application`).
- **`src/types/`**: Global TypeScript interfaces (`IGig`, `IUser`) ensuring strict type safety across the frontend and backend.
- **`src/lib/`**: Utility configurations like the MongoDB connection singleton (`mongoose.ts`).

## 🛡️ Built With
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: MongoDB & Mongoose
- **Web3 Wallet**: @pollar/react
- **Smart Contracts**: @trustless-work/escrow (Stellar/Soroban)
- **Auth**: NextAuth.js
- **File Storage**: Cloudinary
