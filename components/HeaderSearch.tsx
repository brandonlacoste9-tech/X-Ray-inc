import { SearchBox } from "@/components/SearchBox";
import { getSearchIndex } from "@/lib/search-index";

export function HeaderSearch({
  className,
  size,
  defaultValue,
  placeholder,
}: {
  className?: string;
  size?: "default" | "lg";
  defaultValue?: string;
  placeholder?: string;
}) {
  const catalog = getSearchIndex();
  return (
    <SearchBox
      className={className}
      size={size}
      defaultValue={defaultValue}
      placeholder={placeholder}
      catalog={catalog}
    />
  );
}
