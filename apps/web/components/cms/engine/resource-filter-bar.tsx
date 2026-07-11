"use client";
import { useState, useCallback }  from "react";
import { Search, X }              from "lucide-react";
import { Input }                  from "@/components/ui/input";
import { Button }                 from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { cn }                     from "@/lib/utils";
import type { CmsFilterDefinition, CmsListQuery } from "@/lib/cms/types";

interface ResourceFilterBarProps {
  filters?:   CmsFilterDefinition[];
  onSearch:   (q: string) => void;
  onFilter:   (key: string, value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function ResourceFilterBar({
  filters, onSearch, onFilter, placeholder = "Search…", className,
}: ResourceFilterBarProps) {
  const [query, setQuery]                       = useState("");
  const [activeFilters, setActiveFilters]       = useState<Record<string, string>>({});

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  const handleFilter = useCallback((key: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === "all") {
      delete newFilters[key];
      onFilter(key, undefined);
    } else {
      newFilters[key] = value;
      onFilter(key, value);
    }
    setActiveFilters(newFilters);
  }, [activeFilters, onFilter]);

  const hasActiveFilters = query || Object.keys(activeFilters).length > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" aria-hidden="true" />
        <Input
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
          className="pl-9 pr-8"
          aria-label="Search"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic filters */}
      {filters?.map((filter: CmsFilterDefinition) => (
        <Select
          key={filter.key}
          value={activeFilters[filter.key] ?? "all"}
          onValueChange={(v) => handleFilter(filter.key, v)}
        >
          <SelectTrigger className="w-auto min-w-[130px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options?.map((opt: { label: string; value: string }) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear all */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuery("");
            setActiveFilters({});
            onSearch("");
            filters?.forEach(f => onFilter(f.key, undefined));
          }}
          className="text-charcoal-400 hover:text-charcoal-600"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
