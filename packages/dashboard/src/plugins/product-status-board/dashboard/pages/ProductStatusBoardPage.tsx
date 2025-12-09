import { Page, PageTitle } from '@/vdb/framework/layout-engine/page-layout.js';
import { api } from '@/vdb/graphql/api.js';
import { useQuery } from '@tanstack/react-query';
import { Download, Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Pagination } from '../components/Pagination.js';
import { StatsSummary } from '../components/StatsSummary.js';
import { StatusSection } from '../components/StatusSection.js';
import { productStatusBoardListDocument } from '../graphql/product-status-board.graphql.js';
import {
    calculateTotalStock,
    exportProductsToCSV,
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
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['product-status-board'],
        queryFn: () => api.query(productStatusBoardListDocument, {}),
    });

    // Transform products with status - computed once
    const productsWithStatus = useMemo(() => {
        if (!data?.products?.items) return [];
        return data.products.items.map(product => {
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
    }, [data]);

    // Calculate stats from all products (before any filters)
    const stats = useMemo(() => {
        if (productsWithStatus.length === 0) {
            return { total: 0, active: 0, lowStock: 0, outOfStock: 0, disabled: 0 };
        }

        const counts = { active: 0, 'low-stock': 0, 'out-of-stock': 0, disabled: 0 };
        for (const product of productsWithStatus) {
            counts[product.status]++;
        }

        return {
            total: productsWithStatus.length,
            active: counts.active,
            lowStock: counts['low-stock'],
            outOfStock: counts['out-of-stock'],
            disabled: counts.disabled,
        };
    }, [productsWithStatus]);

    const { groupedProducts, totalFiltered, totalPages, allFilteredProducts } = useMemo(() => {
        if (productsWithStatus.length === 0) {
            return { groupedProducts: null, totalFiltered: 0, totalPages: 0, allFilteredProducts: [] };
        }

        // Apply search filter
        const searchFilteredProducts = searchTerm
            ? productsWithStatus.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : productsWithStatus;

        // Apply status filter
        const statusFiltered =
            statusFilter === 'all' ? searchFilteredProducts : searchFilteredProducts.filter(p => p.status === statusFilter);

        const total = statusFiltered.length;
        const pages = Math.ceil(total / pageSize);

        // Apply pagination
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedProducts = statusFiltered.slice(startIndex, startIndex + pageSize);

        return {
            groupedProducts: groupProductsByStatus(paginatedProducts),
            totalFiltered: total,
            totalPages: pages,
            allFilteredProducts: statusFiltered,
        };
    }, [data, searchTerm, statusFilter, currentPage, pageSize]);

    const handleExportCSV = () => {
        if (allFilteredProducts.length > 0) {
            const filename = statusFilter === 'all' ? 'all-products' : `${statusFilter}-products`;
            exportProductsToCSV(allFilteredProducts, filename);
        }
    };

    // Reset to page 1 when filters change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value: ProductStatus | 'all') => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    return (
        <Page pageId="product-status-board">
            <PageTitle>Product Status Board</PageTitle>
            <div className="mt-4">
                {/* Stats Summary */}
                {data && (
                    <StatsSummary
                        stats={stats}
                        onStatusClick={handleStatusFilterChange}
                        activeFilter={statusFilter}
                    />
                )}

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => handleStatusFilterChange(e.target.value as ProductStatus | 'all')}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleExportCSV}
                        disabled={totalFiltered === 0}
                        className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
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
                    <>
                        <div>
                            {STATUS_ORDER.map(status => (
                                <StatusSection key={status} status={status} products={groupedProducts[status]} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={totalFiltered}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </>
                )}
            </div>
        </Page>
    );
}
