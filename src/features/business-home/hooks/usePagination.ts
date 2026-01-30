/**
 * Pagination Hook
 * Reusable pagination logic for tables and lists
 * Migrated from BusinessHomeViews.js pagination functions
 */
import { useState, useCallback, useMemo } from 'react';

interface UsePaginationParams {
  totalItems: number;
  initialPage?: number;
  initialItemsPerPage?: number;
  itemsPerPageOptions?: number[];
}

interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  itemsPerPageOptions: number[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  gotoPage: (page: number) => void;
  gotoFirstPage: () => void;
  gotoLastPage: () => void;
  gotoNextPage: () => void;
  gotoPreviousPage: () => void;
  changeItemsPerPage: (newItemsPerPage: number) => void;
  getPageNumbers: () => number[];
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  initialItemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
}: UsePaginationParams): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage]
  );

  const endIndex = useMemo(
    () => Math.min(startIndex + itemsPerPage, totalItems),
    [startIndex, itemsPerPage, totalItems]
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const gotoPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const gotoFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const gotoLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const gotoNextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [canGoNext]);

  const gotoPreviousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [canGoPrevious]);

  const changeItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const getPageNumbers = useCallback((): number[] => {
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPageOptions,
    canGoPrevious,
    canGoNext,
    gotoPage,
    gotoFirstPage,
    gotoLastPage,
    gotoNextPage,
    gotoPreviousPage,
    changeItemsPerPage,
    getPageNumbers,
  };
};

export default usePagination;
