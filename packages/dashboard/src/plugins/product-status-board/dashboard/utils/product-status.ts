export type ProductStatus = 'active' | 'low-stock' | 'out-of-stock' | 'disabled';
export const LOW_STOCK_THRESHOLD = 10;
export function calculateTotalStock(
    variants: Array<{
        stockLevels: Array<{ stockOnHand: number; stockAllocated: number }>;
    }>,
): number {
    return variants.reduce((total, variant) => {
        const variantStock = variant.stockLevels.reduce(
            (sum, level) => sum + (level.stockOnHand - level.stockAllocated),
            0,
        );
        return total + variantStock;
    }, 0);
}

export function getProductStatus(enabled: boolean, totalStock: number): ProductStatus {
    if (!enabled) {
        return 'disabled';
    }
    if (totalStock <= 0) {
        return 'out-of-stock';
    }
    if (totalStock <= LOW_STOCK_THRESHOLD) {
        return 'low-stock';
    }
    return 'active';
}

export function groupProductsByStatus<T extends { status: ProductStatus }>(
    products: T[],
): Record<ProductStatus, T[]> {
    const result: Record<ProductStatus, T[]> = {
        active: [],
        'low-stock': [],
        'out-of-stock': [],
        disabled: [],
    };
    for (const product of products) {
        result[product.status].push(product);
    }
    return result;
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
    active: 'Active',
    'low-stock': 'Low Stock',
    'out-of-stock': 'Out of Stock',
    disabled: 'Disabled',
};

export interface ExportProduct {
    id: string;
    name: string;
    status: ProductStatus;
    totalStock: number;
    enabled: boolean;
}

export function exportProductsToCSV(products: ExportProduct[], filename = 'products-export'): void {
    const headers = ['ID', 'Name', 'Status', 'Stock', 'Enabled'];
    const rows = products.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        STATUS_LABELS[p.status],
        p.totalStock.toString(),
        p.enabled ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
