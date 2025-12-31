import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface UseSortableTableReturn<T> {
  sortedData: T[];
  sortColumn: string | null;
  sortDirection: SortDirection;
  handleSort: (column: string) => void;
  getSortIndicator: (column: string) => string;
}

export function useSortableTable<T>(
  data: T[],
  defaultColumn?: string,
  defaultDirection: SortDirection = 'asc'
): UseSortableTableReturn<T> {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Alternar direção: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // Nova coluna: começar com asc
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: string): string => {
    if (sortColumn !== column) return '';
    if (sortDirection === 'asc') return ' ▲';
    if (sortDirection === 'desc') return ' ▼';
    return '';
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      // Tratar valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Comparação de strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Comparação de números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Comparação de datas
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }

      // Tentar comparar strings de datas ISO
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }

      // Fallback: comparação genérica
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    getSortIndicator,
  };
}
