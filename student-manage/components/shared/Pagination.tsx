"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (newPage: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-2 py-1 text-sm">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
