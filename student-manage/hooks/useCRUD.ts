import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UseCRUDProps {
  resource: string;
  idField?: string;
  page: number;
  pageSize: number;
  search?: string;
  filters?: Record<string, any[]>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useCRUD = <TData extends Record<string, any>, TForm>({
  resource,
  idField = "id",
  page,
  pageSize,
  search,
  filters = {},
  sortBy,
  sortOrder,
}: UseCRUDProps) => {
  const queryClient = useQueryClient();
  const queryKey = [resource, page, pageSize, search, filters, sortBy, sortOrder];

  // ✅ GET với kiểu rõ ràng
  const query = useQuery<{ items: TData[]; total: number }>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append("search", search);

      Object.entries(filters).forEach(([key, values]) => {
        values.forEach((v) => params.append(key, String(v)));
      });

      if (sortBy) params.append("sort_by", sortBy);
      if (sortOrder) params.append("sort_order", sortOrder);

      const res = await axios.get(`/api/${resource}?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const addMutation = useMutation({
    mutationFn: async (newData: TForm) => {
      const res = await axios.post(`/api/${resource}`, newData);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: TData) => {
      if (!updatedData[idField]) {
        throw new Error(`${idField} is required for update`);
      }
      const res = await axios.put(
        `/api/${resource}/${updatedData[idField]}`,
        updatedData
      );
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(`/api/${resource}/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: number[]; action: string }) => {
      const res = await axios.post(`/api/${resource}/bulk`, { ids, action });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { ...query, addMutation, updateMutation, deleteMutation, bulkMutation };
};
