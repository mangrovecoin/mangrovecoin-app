"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

/* ---------------- API ---------------- */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ""),
  timeout: 15000,
});

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error("NEXT_PUBLIC_API_URL is undefined!");
}

/* ---------------- TYPES ---------------- */

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

/* ---------------- HELPERS ---------------- */

const normalizeApiData = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") return JSON.parse(data);
  if (typeof data?.body === "string") return JSON.parse(data.body);
  return [];
};

const logAxiosError = (label: string, err: unknown) => {
  const e = err as AxiosError;
  console.error(label, {
    message: e.message,
    status: e.response?.status,
    data: e.response?.data,
  });
};

/* ---------------- STATUS STYLES ---------------- */

const statusStyles: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "#f59e0b" },
  VERIFIED: { label: "Verified", color: "#2563eb" },
  APPROVED: { label: "Approved", color: "#10b981" },
  EXCHANGED: { label: "Exchanged", color: "#a855f7" },
  OWNED: { label: "Owned", color: "#16a34a" },
};

/* ---------------- COMPONENT ---------------- */

export default function UserDashboard({ wallet }: { wallet: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [microcredits, setMicrocredits] = useState<Microcredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchangingId, setExchangingId] = useState<string | null>(null);

  /* ---------------- LOAD USER DATA ---------------- */

  const loadUserData = async (address: string) => {
    if (!address || !api.defaults.baseURL) return;

    try {
      // ensure user exists
      await api.get("/user", { params: { wallet: address } });

      const [acts, micros] = await Promise.allSettled([
        api.get("/user/activities", { params: { wallet: address } }),
        api.get("/microcredits", { params: { wallet: address } }),
      ]);

      if (acts.status === "fulfilled") {
        setActivities(normalizeApiData(acts.value.data));
      } else {
        console.warn("Activities fetch failed", acts.reason);
      }

      if (micros.status === "fulfilled") {
        setMicrocredits(normalizeApiData(micros.value.data));
      } else {
        console.warn("Microcredits fetch failed", micros.reason);
      }
    } catch (err) {
      logAxiosError("Load user data error", err);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const createActivity = async () => {
    if (!wallet) return alert("Connect wallet first");

    setLoading(true);
    try {
      const res = await api.post("/activities", { wallet });
      alert(`Activity created: ${res.data.activityId}`);
      await loadUserData(wallet);
    } catch (err) {
      logAxiosError("Create activity error", err);
      alert("Create activity failed");
    } finally {
      setLoading(false);
    }
  };

  const exchangeTokens = async (activityId: string) => {
    if (!wallet || exchangingId) return;

    setExchangingId(activityId);
    try {
      const res = await api.post("/exchange", { wallet, activityId });
      alert(`Tokens exchanged: ${res.data.microId}`);
      await loadUserData(wallet);
    } catch (err: any) {
      alert(err.response?.data?.error || "Exchange failed");
    } finally {
      setExchangingId(null);
    }
  };

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    if (wallet?.length > 10) loadUserData(wallet);
  }, [wallet]);

  /* ---------------- RENDER ---------------- */

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
        const style = statusStyles[a.status] ?? {
          label: a.status,
          color: "#6b7280",
        };

        return (
          <div
            key={a.activityId}
            style={{
              border: `2px solid ${style.color}`,
              padding: 10,
              marginBottom: 10,
              borderRadius: 6,
            }}
          >
            <p><strong>ID:</strong> {a.activityId}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: style.color, fontWeight: "bold" }}>
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
                  borderRadius: 4,
                  marginTop: 6,
                }}
              >
                {exchangingId === a.activityId
                  ? "Exchanging..."
                  : "Exchange to Microcredits"}
              </button>
            )}
          </div>
        );
      })}

      <h3>My Microcredits</h3>

      <p>
        <strong>Total Microcredits:</strong> {microcredits.length}
      </p>

      {microcredits.length === 0 && <p>No microcredits yet</p>}

      {microcredits.map((m) => (
        <div
          key={m.microId}
          style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}
        >
          <p><strong>ID:</strong> {m.microId}</p>
          <p><strong>Status:</strong> {m.status}</p>
        </div>
      ))}
    </div>
  );
}
