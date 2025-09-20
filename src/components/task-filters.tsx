"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Calendar as CalendarIcon,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
} from "date-fns";

export interface FilterOptions {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: "created_at" | "due_date" | "priority" | "title" | "updated_at";
  sortOrder: "asc" | "desc";
  quickFilter:
    | "all"
    | "today"
    | "this_week"
    | "this_month"
    | "overdue"
    | "no_due_date";
}

interface TaskFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function TaskFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isExpanded,
  onToggleExpanded,
}: TaskFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleQuickFilter = (filter: FilterOptions["quickFilter"]) => {
    const now = new Date();
    let dateRange = { from: null as Date | null, to: null as Date | null };

    switch (filter) {
      case "today":
        dateRange = { from: startOfDay(now), to: endOfDay(now) };
        break;
      case "this_week":
        dateRange = { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
        break;
      case "this_month":
        dateRange = { from: startOfDay(subMonths(now, 1)), to: endOfDay(now) };
        break;
      case "overdue":
        dateRange = { from: null, to: startOfDay(now) };
        break;
      case "no_due_date":
        dateRange = { from: null, to: null };
        break;
      default:
        dateRange = { from: null, to: null };
    }

    onFiltersChange({
      ...filters,
      dateRange,
      quickFilter: filter,
    });
  };

  const handleSortChange = (sortBy: FilterOptions["sortBy"]) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const handleSortOrderChange = (sortOrder: FilterOptions["sortOrder"]) => {
    onFiltersChange({
      ...filters,
      sortOrder,
    });
  };

  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
      quickFilter: "all", // Reset quick filter when custom date range is selected
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.sortBy !== "created_at" || filters.sortOrder !== "desc")
      count++;
    if (filters.quickFilter !== "all") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Filter className='h-5 w-5' />
              Task Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {activeFiltersCount > 0 && (
              <Button
                onClick={onClearFilters}
                variant='outline'
                size='sm'
                className='flex items-center gap-1'
              >
                <X className='h-3 w-3' />
                Clear
              </Button>
            )}
            <Button
              onClick={onToggleExpanded}
              variant='ghost'
              size='sm'
              className='flex items-center gap-1'
            >
              {isExpanded ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
        <CardDescription>
          Filter and sort your tasks by date, priority, and more
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className='space-y-4'>
          {/* Quick Filters */}
          <div>
            <label className='text-sm font-medium mb-2 block'>
              Quick Filters
            </label>
            <div className='flex flex-wrap gap-2'>
              {[
                { value: "all", label: "All Tasks" },
                { value: "today", label: "Today" },
                { value: "this_week", label: "This Week" },
                { value: "this_month", label: "This Month" },
                { value: "overdue", label: "Overdue" },
                { value: "no_due_date", label: "No Due Date" },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  onClick={() =>
                    handleQuickFilter(
                      filter.value as FilterOptions["quickFilter"]
                    )
                  }
                  variant={
                    filters.quickFilter === filter.value ? "default" : "outline"
                  }
                  size='sm'
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className='text-sm font-medium mb-2 block'>Date Range</label>
            <div className='flex items-center gap-2'>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='flex items-center gap-2 min-w-[280px] justify-start'
                  >
                    <CalendarIcon className='h-4 w-4' />
                    {filters.dateRange.from && filters.dateRange.to
                      ? `${format(filters.dateRange.from, "MMM dd")} - ${format(
                          filters.dateRange.to,
                          "MMM dd, yyyy"
                        )}`
                      : filters.dateRange.from
                      ? `From ${format(filters.dateRange.from, "MMM dd, yyyy")}`
                      : filters.dateRange.to
                      ? `Until ${format(filters.dateRange.to, "MMM dd, yyyy")}`
                      : "Select date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='range'
                    selected={{
                      from: filters.dateRange.from || undefined,
                      to: filters.dateRange.to || undefined,
                    }}
                    onSelect={(range) => {
                      if (range) {
                        handleDateRangeChange({
                          from: range.from || null,
                          to: range.to || null,
                        });
                      }
                    }}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Button
                  onClick={() =>
                    handleDateRangeChange({ from: null, to: null })
                  }
                  variant='ghost'
                  size='sm'
                  className='flex items-center gap-1'
                >
                  <X className='h-3 w-3' />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Sort Options */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>Sort By</label>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_at'>Created Date</SelectItem>
                  <SelectItem value='due_date'>Due Date</SelectItem>
                  <SelectItem value='priority'>Priority</SelectItem>
                  <SelectItem value='title'>Title</SelectItem>
                  <SelectItem value='updated_at'>Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>Order</label>
              <Select
                value={filters.sortOrder}
                onValueChange={handleSortOrderChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>
                    <div className='flex items-center gap-2'>
                      <SortDesc className='h-4 w-4' />
                      Descending
                    </div>
                  </SelectItem>
                  <SelectItem value='asc'>
                    <div className='flex items-center gap-2'>
                      <SortAsc className='h-4 w-4' />
                      Ascending
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className='border-t pt-4'>
              <div className='text-sm text-gray-600'>
                <strong>Active Filters:</strong>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {filters.quickFilter !== "all" && (
                    <Badge variant='secondary' className='text-xs'>
                      {filters.quickFilter.replace("_", " ")}
                    </Badge>
                  )}
                  {(filters.dateRange.from || filters.dateRange.to) && (
                    <Badge variant='secondary' className='text-xs'>
                      Custom Date Range
                    </Badge>
                  )}
                  <Badge variant='secondary' className='text-xs'>
                    Sort: {filters.sortBy.replace("_", " ")} (
                    {filters.sortOrder})
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
