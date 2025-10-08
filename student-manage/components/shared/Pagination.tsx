"use client";

import { Button } from "../ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (newPage: number) => void;
  maxButtons?: number; // Tổng số nút hiển thị (bao gồm số + "...")
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  maxButtons = 5,
}: PaginationProps) {
  if (totalPages === 0) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= maxButtons) {
    // Nếu tổng trang ít hơn maxButtons thì hiển thị hết
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1); // Luôn có trang đầu

    if (page <= 3) {
      // Gần đầu → 1 2 3 ... N
      pages.push(2);
      pages.push(3);
      pages.push("...");
    } else if (page >= totalPages - 2) {
      // Gần cuối → 1 ... N-2 N-1 N
      pages.push("...");
      pages.push(totalPages - 2);
      pages.push(totalPages - 1);
    } else {
      // Ở giữa → 1 ... page ... N
      pages.push("...");
      pages.push(page);
      pages.push("...");
    }

    pages.push(totalPages); // Luôn có trang cuối
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Trang đầu */}
      <Button
        variant="outline"
        onClick={() => onChange(1)}
        disabled={page === 1}
      >
        {"<<"}
      </Button>

      {/* Prev */}
      <Button
        variant="outline"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        {"<"}
      </Button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm">
            ...
          </span>
        ) : (
          <Button
            key={`page-${p}-${idx}`}
            variant={page === p ? "default" : "outline"}
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        variant="outline"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        {">"}
      </Button>

      {/* Trang cuối */}
      <Button
        variant="outline"
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
      >
        {">>"}
      </Button>
    </div>
  );
}
