import { useState, useEffect } from "react";
import axios from "axios";
import { useDebounce } from "@/hooks/useDebounce";

export const useServerSearch = <T>(
  apiUrl: string,
  searchTerm: string,
  key = "items"
) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedSearch && debouncedSearch !== "") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(apiUrl, {
          params: { search: debouncedSearch, all: true },
        });
        setItems(res.data[key] || res.data);
      } catch (err) {
        console.error("Server search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, apiUrl, key]);

  return { items, loading, setItems };
};
