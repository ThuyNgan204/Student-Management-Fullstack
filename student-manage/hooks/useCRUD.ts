import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UseCRUDProps {
  resource: string;
  idField?: string; // <--- Chìa khóa chính để update/delete (vd: student_id, lecturer_id...)
  page: number;
  pageSize: number;
  search?: string;
  filters?: Record<string, any[]>; // <--- Tự do truyền các filters: { gender: ['Male'], major_id: [1, 2] }
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useCRUD = <TData extends Record<string, any>, TForm>({
  resource,
  idField = "id", // <--- Mặc định là "id", nhưng khi dùng thì truyền "student_id" hoặc "lecturer_id"
  page,
  pageSize,
  search,
  filters = {},
  sortBy,
  sortOrder,
}: UseCRUDProps) => {
  const queryClient = useQueryClient();
  const queryKey = [resource, page, pageSize, search, filters, sortBy, sortOrder];

  // GET
  const query = useQuery({
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

  // CREATE
  const addMutation = useMutation({
    mutationFn: async (newData: TForm) => {
      const res = await axios.post(`/api/${resource}`, newData);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  // UPDATE
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(`/api/${resource}/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  return { ...query, addMutation, updateMutation, deleteMutation };
};
