"use client";

import { Button } from "../ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (newPage: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        {"<"}
      </Button>
      
      {[...Array(totalPages)].map((_, i) => (
        <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} onClick={() => onChange(page + 1)}>
          {i + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        {">"}
      </Button>
    </div>
  );
}
