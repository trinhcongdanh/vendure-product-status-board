import { AlertTriangle, CheckCircle, Package, PackageX, XCircle } from 'lucide-react';
import { ProductStatus } from '../utils/product-status.js';

interface StatsData {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    disabled: number;
}

interface StatsSummaryProps {
    stats: StatsData;
    onStatusClick: (status: ProductStatus | 'all') => void;
    activeFilter: ProductStatus | 'all';
}

const STAT_CARDS: {
    key: keyof StatsData | 'all';
    label: string;
    filterValue: ProductStatus | 'all';
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
}[] = [
    {
        key: 'total',
        label: 'Total Products',
        filterValue: 'all',
        icon: Package,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50 hover:bg-blue-100',
    },
    {
        key: 'active',
        label: 'Active',
        filterValue: 'active',
        icon: CheckCircle,
        colorClass: 'text-green-600',
        bgClass: 'bg-green-50 hover:bg-green-100',
    },
    {
        key: 'lowStock',
        label: 'Low Stock',
        filterValue: 'low-stock',
        icon: AlertTriangle,
        colorClass: 'text-yellow-600',
        bgClass: 'bg-yellow-50 hover:bg-yellow-100',
    },
    {
        key: 'outOfStock',
        label: 'Out of Stock',
        filterValue: 'out-of-stock',
        icon: PackageX,
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50 hover:bg-red-100',
    },
    {
        key: 'disabled',
        label: 'Disabled',
        filterValue: 'disabled',
        icon: XCircle,
        colorClass: 'text-gray-600',
        bgClass: 'bg-gray-50 hover:bg-gray-100',
    },
];

export function StatsSummary({ stats, onStatusClick, activeFilter }: StatsSummaryProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {STAT_CARDS.map(card => {
                const Icon = card.icon;
                const value = card.key === 'total' ? stats.total : stats[card.key as keyof StatsData];
                const isActive = activeFilter === card.filterValue;

                return (
                    <button
                        key={card.key}
                        onClick={() => onStatusClick(card.filterValue)}
                        className={`p-4 rounded-lg transition-all text-left ${card.bgClass} ${
                            isActive ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <Icon className={`w-5 h-5 ${card.colorClass}`} />
                            {card.key !== 'total' && stats.total > 0 && (
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${card.colorClass} bg-white/50`}
                                >
                                    {((value / stats.total) * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>
                        <p className={`text-2xl font-bold mt-2 ${card.colorClass}`}>{value}</p>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                    </button>
                );
            })}
        </div>
    );
}
