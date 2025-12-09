import { ProductStatus, STATUS_LABELS } from '../utils/product-status.js';
import { ProductCard } from './ProductCard.js';

interface ProductData {
    id: string;
    name: string;
    imageUrl?: string;
    status: ProductStatus;
    totalStock: number;
    enabled: boolean;
}

interface StatusSectionProps {
    status: ProductStatus;
    products: ProductData[];
}

export function StatusSection({ status, products }: StatusSectionProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
                {STATUS_LABELS[status]} ({products.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        imageUrl={product.imageUrl}
                        status={product.status}
                        totalStock={product.totalStock}
                        enabled={product.enabled}
                    />
                ))}
            </div>
        </div>
    );
}
