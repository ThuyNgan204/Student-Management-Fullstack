"use client";

import { X } from "lucide-react";

interface SearchBarProps {
  search: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ search, onChange, onClear }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 py-1 text-sm w-64"
      />
      {search && (
        <button onClick={onClear} className="p-1 rounded bg-gray-200 hover:bg-gray-300">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
