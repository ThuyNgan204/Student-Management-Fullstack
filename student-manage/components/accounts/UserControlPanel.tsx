"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UserControlPanelProps {
  total: number;
  search: string;
  setSearch: (v: string) => void;
  onAdd: () => void;
  onBulkAction: (action: "delete" | "activate" | "deactivate" | "reset") => void;
}

export default function UserControlPanel({ total, search, setSearch, onAdd, onBulkAction }: UserControlPanelProps) {
  const [bulkAction, setBulkAction] = useState("");

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-2 md:mb-0">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="border rounded px-2 py-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={onAdd}>Thêm người dùng</Button>
      </div>

      <div className="flex items-center gap-2">
        <span>Tổng người dùng: {total}</span>

        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Bulk Actions</option>
          <option value="activate">Activate</option>
          <option value="deactivate">Deactivate</option>
          <option value="reset">Reset Password</option>
          <option value="delete">Delete</option>
        </select>

        <Button
          variant="secondary"
          onClick={() => {
            if (bulkAction) {
              onBulkAction(bulkAction as any);
              setBulkAction("");
            }
          }}
        >
          Áp dụng
        </Button>

        <Button
          variant="outline"
          onClick={() => onBulkAction("reset")}
        >
          Import/Export Excel
        </Button>
      </div>
    </div>
  );
}
