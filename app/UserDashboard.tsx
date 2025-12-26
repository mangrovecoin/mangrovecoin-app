"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ""),
  timeout: 15000,
});

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
  const [exchangingId, setExchangingId] = useState<string | null>(null);
  const parseApiData = (data: any) => {
  if (!data) return [];
  if (typeof data === "string") return JSON.parse(data);
  if (typeof data?.body === "string") return JSON.parse(data.body);
  return data;
  };

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error("NEXT_PUBLIC_API_URL is undefined!");
  }

  const statusStyles: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "#f59e0b" },     // amber
  VERIFIED: { label: "Verified", color: "#2563eb" },   // blue
  APPROVED: { label: "Approved", color: "#10b981" },  // green
  EXCHANGED: { label: "Exchanged", color: "#c5a3fcff" }, // purple
  OWNED: { label: "Owned", color: "#16a34a" },         // deep green
  };

  // ---------------- LOAD USER DATA ----------------
  const loadUserData = async (address: string) => {
    if (!address || !process.env.NEXT_PUBLIC_API_URL) return;

    try {
      // Ensure user exists
      await api.get("/user", { params: { wallet: address } });

      // Fetch independently (do NOT let one failure kill both)
      const [actsRes, microRes] = await Promise.allSettled([
        api.get("/user/activities", { params: { wallet: address } }),
        api.get("/microcredits", { params: { wallet: address } }),
      ]);

      if (actsRes.status === "fulfilled") {
        setActivities(actsRes.value.data || []);
      } else {
        console.warn("Activities fetch failed", actsRes.reason);
      }

      if (microRes.status === "fulfilled") {
      const raw = microRes.value.data;

      let items: any[] = [];

      if (Array.isArray(raw)) {
        items = raw;
      } else if (typeof raw?.body === "string") {
        items = JSON.parse(raw.body);
      } else if (typeof raw === "string") {
        items = JSON.parse(raw);
      }

      setMicrocredits(items);
      console.log("✅ Microcredits loaded:", items);

     }

 
      else {
        console.warn("Microcredits fetch failed", microRes.reason);
      }

    } catch (err) {
      const error = err as AxiosError;
      console.error("Load user data error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  // ---------------- CREATE ACTIVITY ----------------
  const createActivity = async () => {
    if (!wallet) return alert("Connect wallet first");

    setLoading(true);
    try {
      const res = await api.post("/activities", { wallet });
      alert(`Activity created: ${res.data.activityId}`);
      await loadUserData(wallet);
    } catch (err) {
      console.error("Create activity error", err);
      alert("Create activity failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EXCHANGE TOKENS ----------------
const exchangeTokens = async (activityId: string) => {
  if (!wallet || exchangingId) return;

  setExchangingId(activityId);
  try {
    const res = await api.post("/exchange", { wallet, activityId });
    alert(`Tokens exchanged: ${res.data.microId}`);
    await loadUserData(wallet);
  } catch (err: any) {
    console.error("Exchange error", err);
    alert(err.response?.data?.error || "Exchange failed");
  } finally {
    setExchangingId(null);
  }
};


  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (wallet && wallet.length > 10) {
      loadUserData(wallet);
    }
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
        }}
      >
        {loading ? "Creating..." : "Create Activity"}
      </button>

      <h3>My Activities</h3>

{activities.length === 0 && <p>No activities yet</p>}

{activities.map((a) => {
  const style = statusStyles[a.status] || {
    label: a.status,
    color: "#6b7280",
  };

  return (
    <div
      key={a.activityId}
      style={{
        border: `2px solid ${style.color}`,
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
      }}
    >
      <p><strong>ID:</strong> {a.activityId}</p>

      <p>
        <strong>Status:</strong>{" "}
        <span
          style={{
            color: style.color,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {style.label}
        </span>
      </p>

      <p><strong>Reward:</strong> {a.rewardTokens}</p>

      {a.status === "APPROVED" && (
        <button
          disabled={exchangingId === a.activityId}
          onClick={() => exchangeTokens(a.activityId)}
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            marginTop: "6px",
          }}
        >
          {exchangingId === a.activityId ? "Exchanging..." : "Exchange to Microcredits"}
        </button>
      )}
    </div>
  );
})}


<h3>My Microcredits</h3>
<h3>Balance Summary</h3>
<p>
  <strong>Total Microcredits:</strong>{" "}
  {Array.isArray(microcredits) ? microcredits.length : 0}
</p>

{Array.isArray(microcredits) && microcredits.length === 0 && (
  <p>No microcredits yet</p>
)}

{Array.isArray(microcredits) &&
  microcredits.map((m) => (
    <div
      key={m.microId}
      style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "8px" }}
    >
      <p><strong>ID:</strong> {m.microId}</p>
      <p><strong>Status:</strong> {m.status}</p>
    </div>
))}

    </div>
  );
}
