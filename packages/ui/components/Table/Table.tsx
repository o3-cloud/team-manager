import type { ReactNode } from "react";

export interface TableColumn {
  key: string;
  header: string;
}

export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, ReactNode>[];
  zebra?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

export function Table({
  columns,
  rows,
  zebra = false,
  pinRows = false,
  pinCols = false,
  size,
}: TableProps) {
  const classes = [
    "table",
    zebra ? "table-zebra" : undefined,
    pinRows ? "table-pin-rows" : undefined,
    pinCols ? "table-pin-cols" : undefined,
    size ? `table-${size}` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <table className={classes}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows may not have unique ids
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
