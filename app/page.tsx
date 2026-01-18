//PAGE.TSX
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

/* ---------------- TYPES ---------------- */

type Role = "user" | "admin" | null;

/* ---------------- ETHEREUM TYPE FIX ---------------- */

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

/* ---------------- CONFIG ---------------- */

const ADMIN_WALLETS = [
  "0x46448F1c1bD6Ea6A860901746ed9dEC4DaD2E804".toLowerCase(),
];

/* ---------------- PAGE ---------------- */

export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [role, setRole] = useState<Role>(null);
  const [connecting, setConnecting] = useState(false);

  /* ---------------- WALLET CONNECT ---------------- */

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or Base Wallet to continue.");
      return;
    }

    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

    setWallet(address);
          localStorage.setItem("wallet", address);
        } catch (err) {
          console.error("Wallet connection error:", err);
          alert("Failed to connect wallet");
        } finally {
          setConnecting(false);
        }
  };

  /* ---------------- RESTORE WALLET ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) setWallet(saved);
  }, []);

  /* ---------------- ROLE DETECTION ---------------- */

  useEffect(() => {
    if (!wallet) {
      setRole(null);
      return;
    }

    const resolvedRole = ADMIN_WALLETS.includes(wallet.toLowerCase())
      ? "admin"
      : "user";

    setRole(resolvedRole);
  }, [wallet]);

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: 16 }}>
      <button
        onClick={connectWallet}
        disabled={connecting}
        style={{
          backgroundColor: wallet ? "#16a34a" : "#2563eb",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        {connecting ? "Connecting..." : wallet ? "Wallet Connected" : "Connect Wallet"}
      </button>

      <p>
        <strong>Wallet:</strong>{" "}
        {wallet ? wallet : "Not connected"}
      </p>

      {/* ---------------- DASHBOARDS ---------------- */}

      {role === "user" && <UserDashboard wallet={wallet} />}
      {role === "admin" && <AdminDashboard wallet={wallet} />}
      {!role && wallet && <p>Resolving role...</p>}
    </div>
  );
}
