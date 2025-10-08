"use client";

import { Input } from "../ui/input";

interface SearchBarProps {
  search: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ search, onChange, onClear }: SearchBarProps) {

  return (
    <div className="relative w-full md:w-80">
      <Input
        placeholder="Tìm kiếm tên, mã..."
        value={search}
        onChange={(e) => onChange(e.target.value)}
      />
      {search && (
        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          X
        </button>
      )}
    </div>
  );
}
