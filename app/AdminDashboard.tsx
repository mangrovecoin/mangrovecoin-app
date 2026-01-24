// ADMINDASHBOARD
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/* ---------------- API ---------------- */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/",
  headers: { "Content-Type": "application/json" },
});

/* ---------------- TYPES ---------------- */

export interface PendingActivity {
  activityId: string;
  wallet: string;
  status: "PENDING" | "VERIFIED" | "APPROVED";
}

/* ---------------- STYLES ---------------- */

const cardStyle = {
  border: "1px solid #ccc",
  padding: 8,
  marginBottom: 8,
  borderRadius: 6,
};

const btnBase = {
  padding: "6px 10px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  color: "white",
};

const btnVerify = { ...btnBase, backgroundColor: "#f59e0b", marginRight: 8 };
const btnApprove = { ...btnBase, backgroundColor: "#16a34a" };

/* ---------------- COMPONENT ---------------- */

interface AdminDashboardProps {
  wallet: string;
}

export default function AdminDashboard({ wallet }: AdminDashboardProps) {
  const [pendingActivities, setPendingActivities] = useState<PendingActivity[]>([]);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = (label: string, err: unknown) => {
    console.error(label, err);
    alert(label);
  };

  const listPendingActivities = async () => {
    if (!api.defaults.baseURL) return;
    setLoading(true);
    try {
      const res = await api.get<PendingActivity[]>("/admin/activities/pending");
      setPendingActivities(res.data ?? []);
    } catch (err) {
      handleError("Failed to load pending activities", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyActivity = async (activityId: string) => {
    try {
      await api.post(`/activities/${activityId}/verify`);
      setPendingActivities(prev =>
        prev.map(a =>
          a.activityId === activityId ? { ...a, status: "VERIFIED" } : a
        )
      );
      alert("Activity verified!");
    } catch (err) {
      handleError("Failed to verify activity", err);
    }
  };

  const approveAndMint = async (activityId: string) => {
    setMintingId(activityId);
    try {
      await api.post(`/activities/${activityId}/approve`);
      setPendingActivities(prev =>
        prev.filter(a => a.activityId !== activityId)
      );
      alert("Activity approved and tokens minted!");
    } catch (err) {
      handleError("Failed to approve and mint activity", err);
    } finally {
      setMintingId(null);
    }
  };

  useEffect(() => {
    listPendingActivities();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>

      {loading && <p>Loading...</p>}
      {!loading && pendingActivities.length === 0 && (
        <p>No pending activities</p>
      )}

      {pendingActivities.map(a => (
        <div key={a.activityId} style={cardStyle}>
          <p><strong>ID:</strong> {a.activityId}</p>
          <p><strong>Wallet:</strong> {a.wallet}</p>
          <p><strong>Status:</strong> {a.status}</p>

          {a.status === "PENDING" && (
            <button
              onClick={() => verifyActivity(a.activityId)}
              style={btnVerify}
            >
              Verify
            </button>
          )}

          {a.status === "VERIFIED" && (
            <button
              onClick={() => approveAndMint(a.activityId)}
              style={btnApprove}
              disabled={mintingId === a.activityId}
            >
              {mintingId === a.activityId ? "Minting..." : "Approve & Mint"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
