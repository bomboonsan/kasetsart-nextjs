import React from "react";
import { Button } from "@/components/ui/button";

export default function TablePagination({
  page,
  pageSize,
  itemsCount,
  onPrevious,
  onNext,
  hasNextPage,
  isLoading,
}) {
  const hasItems = itemsCount > 0;
  const startIndex = hasItems ? (page - 1) * pageSize + 1 : 0;
  const endIndex = hasItems ? startIndex + itemsCount - 1 : 0;

  return (
    <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
      <div>
        {hasItems
          ? `หน้า ${page} | รายการที่ ${startIndex}-${endIndex}`
          : `หน้า ${page} | ไม่มีข้อมูล`}
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page <= 1 || isLoading}
        >
          ก่อนหน้า
        </Button>
        <span>หน้า {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
        >
          ถัดไป
        </Button>
      </div>
    </div>
  );
}
