import { Page, PageTitle } from '@/vdb/framework/layout-engine/page-layout.js';
import { api } from '@/vdb/graphql/api.js';
import { useQuery } from '@tanstack/react-query';
import { Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatusSection } from '../components/StatusSection.js';
import { productStatusBoardListDocument } from '../graphql/product-status-board.graphql.js';
import {
    calculateTotalStock,
    getProductStatus,
    groupProductsByStatus,
    ProductStatus,
} from '../utils/product-status.js';

const STATUS_ORDER: ProductStatus[] = ['active', 'low-stock', 'out-of-stock', 'disabled'];
const STATUS_OPTIONS: { value: ProductStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'disabled', label: 'Disabled' },
];

export default function ProductStatusBoardPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['product-status-board'],
        queryFn: () => api.query(productStatusBoardListDocument, {}),
    });

    const groupedProducts = useMemo(() => {
        if (!data?.products?.items) return null;

        const productsWithStatus = data.products.items.map(product => {
            const totalStock = calculateTotalStock(product.variants);
            const status = getProductStatus(product.enabled, totalStock);
            return {
                id: product.id,
                name: product.name,
                imageUrl: product.featuredAsset?.preview,
                status,
                totalStock,
                enabled: product.enabled,
            };
        });

        // Apply search filter
        const searchFiltered = searchTerm
            ? productsWithStatus.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : productsWithStatus;

        // Apply status filter
        const statusFiltered =
            statusFilter === 'all' ? searchFiltered : searchFiltered.filter(p => p.status === statusFilter);

        return groupProductsByStatus(statusFiltered);
    }, [data, searchTerm, statusFilter]);

    const totalFiltered = groupedProducts ? Object.values(groupedProducts).flat().length : 0;

    return (
        <Page pageId="product-status-board">
            <PageTitle>Product Status Board</PageTitle>
            <div className="mt-4">
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as ProductStatus | 'all')}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading products...</span>
                    </div>
                )}

                {isError && (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">Failed to load products</p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {data && totalFiltered === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No products found</p>
                        {(searchTerm || statusFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                }}
                                className="mt-2 text-primary hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {data && totalFiltered > 0 && groupedProducts && (
                    <div>
                        {STATUS_ORDER.map(status => (
                            <StatusSection key={status} status={status} products={groupedProducts[status]} />
                        ))}
                    </div>
                )}
            </div>
        </Page>
    );
}
