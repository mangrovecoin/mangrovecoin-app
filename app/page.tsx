"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const ADMIN_WALLETS = [
    "0x46448F1c1bD6Ea6A860901746ed9dEC4DaD2E804".toLowerCase(),
  ];

  // ---------------- WALLET CONNECT ----------------
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Install MetaMask or Base Wallet to continue");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request wallet connection
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet(address);

      // 🔑 Ensure user exists in backend
      if (API) {
        await axios.get(`${API}/user`, { params: { wallet: address } });
      }
    } catch (err) {
      console.error("Failed to connect wallet", err);
      alert("Failed to connect wallet. Make sure MetaMask is unlocked.");
    }
  };

  // ---------------- ROLE DETECTION ----------------
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

  return (
    <div style={{ padding: "16px" }}>
      <button
        onClick={connectWallet}
        style={{
          backgroundColor: wallet ? "green" : "#2563eb",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "16px",
        }}
      >
        {wallet ? "Connected" : "Connect Wallet"}
      </button>

      <p><strong>Wallet:</strong> {wallet || "Not connected"}</p>

      {/* Render dashboards based on role */}
      {role === "user" && <UserDashboard wallet={wallet} />}
      {role === "admin" && <AdminDashboard wallet={wallet} />}
      {!role && wallet && <p>Loading role...</p>}
    </div>
  );
}
