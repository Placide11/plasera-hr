"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function LeaveActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function act(status: "APPROVED" | "REJECTED") {
    setLoading(status);
    const res = await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("APPROVED")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 rounded-sm border border-status-active px-2.5 py-1.5 text-xs font-medium text-status-active hover:bg-status-active-soft disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
        {loading === "APPROVED" ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={() => act("REJECTED")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 rounded-sm border border-status-rejected px-2.5 py-1.5 text-xs font-medium text-status-rejected hover:bg-status-rejected-soft disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
        {loading === "REJECTED" ? "Rejecting…" : "Reject"}
      </button>
    </div>
  );
}
