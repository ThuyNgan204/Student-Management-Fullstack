import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UseCRUDProps {
  resource: string;
  page: number;
  pageSize: number;
  search?: string;
  genderFilters?: string[];
  classFilters?: string[];
  majorFilters: string[];
  sortBy?: string;
  sortOrder?: string;
}

export const useCRUD = <TData extends { student_id?: number }, TForm>({
  resource,
  page,
  pageSize,
  search,
  genderFilters = [],
  classFilters = [],
  majorFilters = [],
  sortBy,
  sortOrder,
}: UseCRUDProps) => {
  const queryClient = useQueryClient();
  const queryKey = [
    resource,
    page,
    pageSize,
    search,
    genderFilters,
    classFilters,
    majorFilters,
    sortOrder,
  ];

  // GET
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append("search", search);
      genderFilters.forEach((g) => params.append("gender", g));
      classFilters.forEach((c) => params.append("class_code", c));
      majorFilters.forEach((m) => params.append("major_code", m));
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
      if (!updatedData.student_id) {
        throw new Error("student_id is required for update");
      }
      const res = await axios.put(
        `/api/${resource}/${updatedData.student_id}`,
        updatedData
      );
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async (student_id: number) => {
      const res = await axios.delete(`/api/${resource}/${student_id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  return { ...query, addMutation, updateMutation, deleteMutation };
};
