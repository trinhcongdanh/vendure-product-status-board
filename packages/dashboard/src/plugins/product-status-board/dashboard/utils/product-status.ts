export type ProductStatus = 'active' | 'low-stock' | 'out-of-stock' | 'disabled';

// Ngưỡng cảnh báo low stock
export const LOW_STOCK_THRESHOLD = 10;

// Tính tổng tồn kho từ tất cả variants
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
    return {
        active: products.filter(p => p.status === 'active'),
        'low-stock': products.filter(p => p.status === 'low-stock'),
        'out-of-stock': products.filter(p => p.status === 'out-of-stock'),
        disabled: products.filter(p => p.status === 'disabled'),
    };
}
