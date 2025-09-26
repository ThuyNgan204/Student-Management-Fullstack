"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStudentStore } from "@/store/useStudentStore";
import SearchBar from "./SearchBar";

interface ControlPanelProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanel({ total, addLabel, addTotal, onAdd }: ControlPanelProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    genderFilters,
    classFilters,
    openFilter,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setGenderFilters,
    setClassFilters,
    setOpenFilter,
  } = useStudentStore();

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {/* Add button */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium invisible">Add</Label>
          <Button onClick={onAdd} className="whitespace-nowrap">
            {addLabel}
          </Button>
        </div>

        {/* Rows per page */}
        <div className="flex flex-col">
          <Label htmlFor="pageSize" className="mb-1 text-sm font-medium">
            Rows per page
          </Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium">Sort</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="">Field</option>
              <option value="id">ID</option>
              <option value="first_name">Name</option>
              <option value="student_code">Student Code</option>
              <option value="dob">Date of Birth</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
          </div>
        </div>

        {/* Filters dropdown */}
        <div className="relative inline-block text-left">
          <Label className="mb-1 text-sm font-medium">Filters</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Select filters
            {genderFilters.length + classFilters.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({genderFilters.length + classFilters.length})
              </span>
            )}
            <svg
              className={`w-4 h-4 text-gray-500 ml-2 transform ${
                openFilter ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openFilter && (
            <div className="absolute left-0 mt-2 w-44 rounded-lg shadow-lg bg-white border z-10 p-4 space-y-4">
              {/* Gender */}
              <div>
                <p className="font-medium text-sm mb-2">Gender</p>
                {["Male", "Female"].map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={g}
                      checked={genderFilters.includes(g)}
                      onChange={(e) =>
                        setGenderFilters((prev) =>
                          e.target.checked
                            ? [...prev, g]
                            : prev.filter((x) => x !== g)
                        )
                      }
                    />
                    {g}
                  </label>
                ))}
              </div>

              {/* Class
              <div>
                <p className="font-medium text-sm mb-2">Class</p>
                {["10", "11", "12"].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={c}
                      checked={classFilters.includes(c)}
                      onChange={(e) =>
                        setClassFilters((prev) =>
                          e.target.checked
                            ? [...prev, c]
                            : prev.filter((x) => x !== c)
                        )
                      }
                    />
                    {c}
                  </label>
                ))}
              </div> */}

              {/* Reset */}
              <button
                onClick={() => {
                  setGenderFilters([]);
                  setClassFilters([]);
                }}
                className="w-full px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 mt-2"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Search + total */}
        <div className="flex flex-col flex-1 max-w-xs ml-auto">
          <SearchBar
            search={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
          />
          <span className=" mt-1 text-xs text-gray-600 text-right">
            {addTotal}: <span className="font-semibold">{total}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
