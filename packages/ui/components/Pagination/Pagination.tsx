export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const classes = ["join", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          className={["join-item", "btn", page === currentPage ? "btn-active" : undefined]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
