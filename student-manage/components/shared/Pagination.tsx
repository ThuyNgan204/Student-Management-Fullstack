"use client";

import { Button } from "../ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (newPage: number) => void;
  maxButtons?: number; // tối đa số nút hiển thị giữa
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
    // Nếu số trang nhỏ hơn maxButtons thì hiển thị tất cả
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const half = Math.floor(maxButtons / 2);

    if (page <= half + 1) {
      // đầu danh sách: 1 2 3 ... totalPages
      for (let i = 1; i <= maxButtons - 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (page >= totalPages - half) {
      // cuối danh sách: 1 ... totalPages-2 totalPages-1 totalPages
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - (maxButtons - 2); i <= totalPages; i++) pages.push(i);
    } else {
      // giữa danh sách: 1 ... p-1 p p+1 ... totalPages
      pages.push(1);
      pages.push("...");
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
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
          <span key={idx} className="px-2 py-1 text-sm">
            ...
          </span>
        ) : (
          <Button
            key={p}
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
