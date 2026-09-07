"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
  redirectTo,
}: {
  employeeId: string;
  employeeName: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-sm border border-line bg-panel p-5">
        <h3 className="font-display text-base font-medium text-ink">
          Delete {employeeName}?
        </h3>
        <p className="mt-2 text-sm text-ink-soft">
          This removes their profile, leave history, and activity log. This
          can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting…" : "Delete employee"}
          </Button>
        </div>
      </div>
    </div>
  );
}
