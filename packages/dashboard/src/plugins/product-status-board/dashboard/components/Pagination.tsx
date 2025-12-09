import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    if (totalPages <= 1 && totalItems <= PAGE_SIZE_OPTIONS[0]) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => {
        if (totalPages <= 7) return true;
        if (page === 1 || page === totalPages) return true;
        if (Math.abs(page - currentPage) <= 1) return true;
        return false;
    });

    return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
                Showing {startItem} - {endItem} of {totalItems} products
            </div>
            <div className="flex items-center gap-4">
                <select
                    value={pageSize}
                    onChange={e => onPageSizeChange(Number(e.target.value))}
                    className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                        {visiblePages.map((page, index, arr) => (
                            <span key={page} className="flex items-center">
                                {index > 0 && arr[index - 1] !== page - 1 && (
                                    <span className="px-2 text-muted-foreground">...</span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-[32px] h-8 px-2 rounded-md ${
                                        currentPage === page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    {page}
                                </button>
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
