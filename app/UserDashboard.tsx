//USERDASHBOARD
"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

/* ---------------- API ---------------- */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ---------------- TYPES ---------------- */

export interface Activity {
  activityId: string;
  wallet: string;
  status: "PENDING" | "VERIFIED" | "APPROVED" | "EXCHANGED" | string;
  rewardTokens: number;
}

export interface Microcredit {
  microId: string;
  owner: string;
  status: "OWNED" | string;
}

/* ---------------- STATUS STYLES ---------------- */

const statusStyles: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "#f59e0b" },
  VERIFIED: { label: "Verified", color: "#2563eb" },
  APPROVED: { label: "Approved", color: "#10b981" },
  EXCHANGED: { label: "Exchanged", color: "#a855f7" },
  OWNED: { label: "Owned", color: "#16a34a" },
};

/* ---------------- COMPONENT ---------------- */

interface UserDashboardProps {
  wallet: string;
}

export default function UserDashboard({ wallet }: UserDashboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [microcredits, setMicrocredits] = useState<Microcredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchangingId, setExchangingId] = useState<string | null>(null);

  const loadUserData = async (address: string) => {
    if (!address || !api.defaults.baseURL) return;

    try {
      // ensure user exists
      await api.get("/user", { params: { wallet: address } });

      const [acts, micros] = await Promise.allSettled([
        api.get<Activity[]>("/user/activities", { params: { wallet: address } }),
        api.get<Microcredit[]>("/microcredits", { params: { wallet: address } }),
      ]);

      if (acts.status === "fulfilled") setActivities(acts.value.data ?? []);
      if (micros.status === "fulfilled") setMicrocredits(micros.value.data ?? []);
    } catch (err) {
      console.error("Load user data error", err);
    }
  };

  const createActivity = async () => {
    if (!wallet) return alert("Connect wallet first");
    setLoading(true);
    try {
      const res = await api.post<{ activityId: string }>("/activities", { wallet });
      alert(`Activity created: ${res.data.activityId}`);
      await loadUserData(wallet);
    } catch (err) {
      console.error("Create activity error", err);
      alert("Create activity failed");
    } finally {
      setLoading(false);
    }
  };

  const exchangeTokens = async (activityId: string) => {
    if (!wallet || exchangingId) return;
    setExchangingId(activityId);
    try {
      const res = await api.post<{ microId: string }>("/exchange", { wallet, activityId });
      alert(`Tokens exchanged: ${res.data.microId}`);
      await loadUserData(wallet);
    } catch (err: any) {
      alert(err.response?.data?.error || "Exchange failed");
    } finally {
      setExchangingId(null);
    }
  };

  useEffect(() => {
    if (wallet) loadUserData(wallet);
  }, [wallet]);

  return (
    <div style={{ padding: 16 }}>
      <h2>User Dashboard</h2>
      <p><strong>Wallet:</strong> {wallet}</p>

      <button
        onClick={createActivity}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "8px 12px",
          borderRadius: 6,
          marginBottom: 12,
        }}
      >
        {loading ? "Creating..." : "Create Activity"}
      </button>

      <h3>My Activities</h3>
      {activities.length === 0 && <p>No activities yet</p>}
      {activities.map((a) => {
        const style = statusStyles[a.status] ?? { label: a.status, color: "#6b7280" };
        return (
          <div key={a.activityId} style={{ border: `2px solid ${style.color}`, padding: 10, marginBottom: 10, borderRadius: 6 }}>
            <p><strong>ID:</strong> {a.activityId}</p>
            <p><strong>Status:</strong> <span style={{ color: style.color, fontWeight: "bold" }}>{style.label}</span></p>
            <p><strong>Reward:</strong> {a.rewardTokens}</p>

            {a.status === "APPROVED" && (
              <button
                disabled={exchangingId === a.activityId}
                onClick={() => exchangeTokens(a.activityId)}
                style={{ backgroundColor: "#16a34a", color: "white", padding: "6px 10px", borderRadius: 4, marginTop: 6 }}
              >
                {exchangingId === a.activityId ? "Exchanging..." : "Exchange to Microcredits"}
              </button>
            )}
          </div>
        );
      })}

      <h3>My Microcredits</h3>
      <p><strong>Total Microcredits:</strong> {microcredits.length}</p>
      {microcredits.length === 0 && <p>No microcredits yet</p>}
      {microcredits.map((m) => (
        <div key={m.microId} style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
          <p><strong>ID:</strong> {m.microId}</p>
          <p><strong>Status:</strong> {m.status}</p>
        </div>
      ))}
    </div>
  );
}
