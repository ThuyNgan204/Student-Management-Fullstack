import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServerSearch } from "@/hooks/useServerSearch";
import { useState } from "react";

type Props<T> = {
  apiUrl?: string;
  items?: T[];
  value: string | undefined;
  onChange: (val: string) => void;
  labelKey: (item: T) => string;
  valueKey: (item: T) => string;
  placeholder?: string;
};

export default function SearchableSelect<T>({
  apiUrl,
  items = [],
  value,
  onChange,
  labelKey,
  valueKey,
  placeholder,
}: Props<T>) {
  const [search, setSearch] = useState("");

  const { items: serverItems, loading } = apiUrl ? useServerSearch<T>(apiUrl, search) : { items, loading: false };

  const displayItems = apiUrl ? serverItems : items;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {loading ? <SelectItem value="">Đang tải...</SelectItem> :
          displayItems.map((item) => (
            <SelectItem key={valueKey(item)} value={valueKey(item)}>
              {labelKey(item)}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
}
