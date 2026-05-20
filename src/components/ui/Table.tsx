import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { Skeleton } from './Skeleton';

/**
 * Table
 * - Sortable headers (when column.sortable is true)
 * - Loading skeleton with shimmer
 * - Empty state with illustration + message
 * - On <md collapses each row into a stacked card
 */
export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  className?: string;
  hiddenOnMobile?: boolean;
  /** Mobile-only label used when the table collapses to cards. */
  mobileLabel?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
  caption?: string;
}

type SortDirection = 'asc' | 'desc' | null;

const ALIGN_MAP = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function Table<T>({
  columns,
  data,
  isLoading = false,
  loadingRows = 6,
  emptyState,
  rowKey,
  onRowClick,
  className,
  caption,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortAccessor) return data;
    const accessor = column.sortAccessor;
    const cloned = [...data];
    cloned.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [data, columns, sortKey, sortDir]);

  const onHeaderClick = (column: TableColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir('asc');
  };

  if (isLoading) {
    return <TableSkeleton columns={columns} rows={loadingRows} className={className} />;
  }

  if (sortedData.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-surface-200 bg-surface-50 p-10 dark:border-surface-800 dark:bg-surface-900',
          className,
        )}
      >
        {emptyState ?? (
          <ListEmptyState
            title="No hay resultados"
            description="Cuando haya información disponible aparecerá aquí."
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900 md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="border-b border-surface-200 bg-surface-100/60 text-label uppercase tracking-wide text-surface-500 dark:border-surface-800 dark:bg-surface-800/40 dark:text-surface-400">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap px-4 py-3',
                      ALIGN_MAP[col.align ?? 'left'],
                      col.sortable && 'cursor-pointer select-none transition-colors hover:text-surface-700 dark:hover:text-surface-200',
                      col.className,
                    )}
                    onClick={() => onHeaderClick(col)}
                    aria-sort={
                      sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none') : 'none'
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable ? (
                        sortKey === col.key && sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden />
                        ) : sortKey === col.key && sortDir === 'desc' ? (
                          <ArrowDown className="h-3 w-3" aria-hidden />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                        )
                      ) : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm text-surface-800 dark:text-surface-200">
              {sortedData.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-t border-surface-200 transition-colors dark:border-surface-800',
                    onRowClick && 'cursor-pointer hover:bg-primary-50/40 dark:hover:bg-primary-900/15',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 align-middle', ALIGN_MAP[col.align ?? 'left'], col.className)}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-3 md:hidden">
        {sortedData.map((row) => (
          <li
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              'rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900',
              onRowClick && 'cursor-pointer transition-colors active:bg-primary-50/40 dark:active:bg-primary-900/15',
            )}
          >
            <div className="flex flex-col gap-2">
              {columns
                .filter((c) => !c.hiddenOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-3 text-body-sm">
                    <span className="shrink-0 text-caption font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
                      {col.mobileLabel ?? (typeof col.header === 'string' ? col.header : col.key)}
                    </span>
                    <span className="min-w-0 flex-1 text-right">{col.cell(row)}</span>
                  </div>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TableSkeleton<T>({
  columns,
  rows,
  className,
}: {
  columns: TableColumn<T>[];
  rows: number;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900', className)}>
      <div className="hidden md:block">
        <div className="grid border-b border-surface-200 bg-surface-100/60 px-4 py-3 dark:border-surface-800 dark:bg-surface-800/40" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map((c) => (
            <Skeleton key={c.key} className="h-3 w-20" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid items-center border-t border-surface-200 px-4 py-4 dark:border-surface-800"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((c) => (
              <Skeleton key={c.key} className="h-4 w-3/4" />
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-surface-200 p-4 dark:border-surface-800">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
