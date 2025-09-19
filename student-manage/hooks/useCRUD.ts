import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UseCRUDProps {
  resource: string;
  page: number;
  pageSize: number;
  search?: string;
  genderFilters?: string[];
  classFilters?: string[];
  sortBy?: string;
  sortOrder?: string;
}

export const useCRUD = <TData, TForm>({
  resource,
  page,
  pageSize,
  search,
  genderFilters = [],
  classFilters = [],
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
    sortBy,
    sortOrder,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append("search", search);
      genderFilters.forEach((g) => params.append("gender", g));
      classFilters.forEach((c) => params.append("class_prefix", c));
      if (sortBy) params.append("sort_by", sortBy);
      if (sortOrder) params.append("sort_order", sortOrder);

      const res = await axios.get(`http://localhost:8000/${resource}/?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const addMutation = useMutation({
    mutationFn: (newData: TForm) => axios.post(`http://localhost:8000/${resource}/`, newData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData: TData) =>
      axios.put(`http://localhost:8000/${resource}/${(updatedData as any).id}`, updatedData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`http://localhost:8000/${resource}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
  });

  return { ...query, addMutation, updateMutation, deleteMutation };
};