"use client";

import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export interface Column<T> {
  key: keyof T | string;
  header: ReactNode;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-300">
          {columns.map((col, i) => (
            <TableHead
              key={i}
              className={`p-3 border text-left ${col.className || ""}`}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item, rowIndex) => (
            <TableRow key={rowIndex} className="border">
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className={`p-3 border ${col.className || ""}`}>
                  {col.render
                    ? col.render(item)
                    : // @ts-ignore (can get dynamic key)
                      (item[col.key] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center p-3 text-gray-500"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
