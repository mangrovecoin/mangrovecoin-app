"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Activity {
  activityId: string;
  wallet: string;
  status: string;
  rewardTokens: number;
}

interface Microcredit {
  microId: string;
  owner: string;
  status: string;
}

export default function UserDashboard({ wallet }: { wallet: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [microcredits, setMicrocredits] = useState<Microcredit[]>([]);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;
  if (!API) console.error("NEXT_PUBLIC_API_URL is undefined!");

  // ---------------- LOAD USER DATA ----------------
  const loadUserData = async (address: string) => {
    if (!API) return;

    try {
      // Ensure user exists in backend
      await axios.get(`${API}/user`, { params: { wallet: address } });

      // Fetch activities and microcredits in parallel
      const [acts, micros] = await Promise.all([
        axios.get(`${API}/user/activities`, { params: { wallet: address } }),
        axios.get(`${API}/microcredits`, { params: { wallet: address } }),
      ]);

      setActivities(acts.data || []);
      setMicrocredits(micros.data || []);
    } catch (err) {
      console.error("Failed to load user data", err);
      console.warn("User data load failed (likely empty state)");
    }
  };

  // ---------------- CREATE ACTIVITY ----------------
  const createActivity = async () => {
    if (!wallet) return alert("Connect wallet first");
    if (!API) return alert("API not configured");

    setLoading(true);
    try {
      const res = await axios.post(`${API}/activities`, { wallet });
      alert(`Activity created: ${res.data.activityId}`);
      await loadUserData(wallet);
    } catch (err) {
      console.error("Create activity error:", err);
      alert("Create activity failed");
    }
    setLoading(false);
  };

  // ---------------- EXCHANGE TOKENS ----------------
  const exchangeTokens = async () => {
    if (!wallet) return alert("Connect wallet first");
    if (!API) return alert("API not configured");

    try {
      const res = await axios.post(`${API}/exchange`, { wallet });
      alert(`Tokens exchanged to microcredit: ${res.data.microId}`);
      await loadUserData(wallet);
    } catch (err) {
      console.error("Exchange error:", err);
      alert("Exchange failed");
    }
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (wallet) loadUserData(wallet);
  }, [wallet]);

  // ---------------- RENDER ----------------
  return (
    <div style={{ padding: "16px" }}>
      <h2>User Dashboard</h2>
      <p><strong>Wallet:</strong> {wallet}</p>

      <button
        onClick={createActivity}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          marginBottom: "12px",
          cursor: "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Activity"}
      </button>

      <h3>My Activities</h3>
      {activities.length === 0 && <p>No activities yet</p>}
      {activities.map((a) => (
        <div key={a.activityId} style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "8px" }}>
          <p><strong>ID:</strong> {a.activityId}</p>
          <p><strong>Status:</strong> {a.status}</p>
          <p><strong>Reward:</strong> {a.rewardTokens} tokens</p>

          {a.status === "APPROVED" && (
            <button
              onClick={exchangeTokens}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "6px 10px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "6px",
              }}
            >
              Exchange to Microcredit
            </button>
          )}
        </div>
      ))}

      <h3>My Microcredits</h3>
      {microcredits.length === 0 && <p>No microcredits yet</p>}
      {microcredits.map((m) => (
        <div key={m.microId} style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "8px" }}>
          <p><strong>ID:</strong> {m.microId}</p>
          <p><strong>Status:</strong> {m.status}</p>
        </div>
      ))}
    </div>
  );
}
