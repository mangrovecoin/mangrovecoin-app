"use client";

import { useEffect, useState } from "react";
import axios from "axios";


export default function AdminDashboard() {
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [minting, setMinting] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL!;

  /* ---------------- ADMIN PENDING LIST ---------------- */  
  async function loadPendingActivities() {
  try {
    const res = await axios.get(
      `${API}/admin/activities/pending`
    );
    setPendingActivities(res.data);
  } catch (err) {
    console.error("Failed to load pending activities", err);
  }
}

/* ---------------- VERIFY ---------------- */
async function verifyActivity(activityId: string) {
  try {
    await axios.post(
      `${API}/activities/${activityId}/verify`,
      {}, // EMPTY BODY REQUIRED
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    alert("Activity verified!");

    // Update UI status locally
    setPendingActivities((prev) =>
      prev.map((a) =>
        a.activityId === activityId ? { ...a, status: "VERIFIED" } : a
      )
    );
  } catch (err) {
    console.error("Failed to verify activity", err);
    alert("Failed to verify activity");
  }
}

/* ---------------- APPROVE ---------------- */
   async function approveAndMint(activityId: string, wallet: string) {
  try {
    // Approve activity
  await axios.post(
    `${API}/activities/${activityId}/approve`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

    // Mint tokens (10 tokens as per backend)
    setMinting(activityId);
    await axios.post(`${API}/mint`, { wallet, amount: 10 });
    setMinting(null);

    alert("Activity approved and tokens minted!");

    // Remove activity from list
    setPendingActivities((prev) =>
      prev.filter((activity) => activity.activityId !== activityId)
    );
  } catch (err) {
    console.error("Failed to approve and mint", err);
    alert("Failed to approve and mint activity");
    setMinting(null);
  }
}


/* ---------------- LOAD PENDING ---------------- */

  useEffect(() => {
    loadPendingActivities();
  }, []);


/* ---------------- RENDER LOGIC ---------------- */
  return (
    <div>
      <h2>Admin Dashboard</h2>
      {pendingActivities.map((a) => (
  <div
    key={a.activityId}
    style={{
      border: "1px solid #ccc",
      padding: "8px",
      marginBottom: "8px",
    }}
  >
    <p><strong>ID:</strong> {a.activityId}</p>
    <p><strong>Wallet:</strong> {a.wallet}</p>
    <p><strong>Status:</strong> {a.status}</p>

    {a.status === "PENDING" && (
      <button
        onClick={() => verifyActivity(a.activityId)}
        style={{
          marginRight: "8px",
          backgroundColor: "orange",
          color: "white",
          padding: "4px 8px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Verify
      </button>
    )}

    {a.status === "VERIFIED" && (
      <button
        onClick={() => approveAndMint(a.activityId, a.wallet)}
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "4px 8px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        disabled={minting === a.activityId}
      >
        {minting === a.activityId ? "Minting..." : "Approve & Mint"}
      </button>
    )}
  </div>
))}

    </div>
  );
}
