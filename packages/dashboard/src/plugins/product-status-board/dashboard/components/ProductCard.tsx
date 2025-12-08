import { Card, CardContent } from '@/vdb/components/ui/card.js';
import { Switch } from '@/vdb/components/ui/switch.js';
import { api } from '@/vdb/graphql/api.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ExternalLink, Package } from 'lucide-react';
import { toast } from 'sonner';
import { updateProductEnabledDocument } from '../graphql/product-status-board.graphql.js';
import { ProductStatus } from '../utils/product-status.js';

const STATUS_STYLES: Record<ProductStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    'low-stock': { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-700' },
    'out-of-stock': { label: 'Out of Stock', className: 'bg-red-100 text-red-700' },
    disabled: { label: 'Disabled', className: 'bg-gray-100 text-gray-700' },
};

interface ProductCardProps {
    id: string;
    name: string;
    imageUrl?: string;
    status: ProductStatus;
    totalStock: number;
    enabled: boolean;
}

export function ProductCard({ id, name, imageUrl, status, totalStock, enabled }: ProductCardProps) {
    const statusStyle = STATUS_STYLES[status];
    const queryClient = useQueryClient();
    const toggleMutation = useMutation({
        mutationFn: (newEnabled: boolean) =>
            api.mutate(updateProductEnabledDocument, {
                input: { id, enabled: newEnabled },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-status-board'] });
            toast.success('Product updated!');
        },
        onError: () => {
            toast.error('Failed to update product');
        },
    });

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-muted flex items-center justify-center">
                {imageUrl ? (
                    <img src={`${imageUrl}?preset=small`} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <Package className="w-12 h-12 text-muted-foreground" />
                )}
            </div>

            <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-sm line-clamp-2">{name}</h3>

                <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyle.className}`}
                >
                    {statusStyle.label}
                </span>

                <p className="text-sm text-muted-foreground">Stock: {totalStock}</p>

                <div className="flex items-center justify-between">
                    <span className="text-sm">Enabled</span>
                    <Switch
                        checked={enabled}
                        onCheckedChange={checked => toggleMutation.mutate(checked)}
                        disabled={toggleMutation.isPending}
                    />
                </div>

                <Link
                    to="/products/$id"
                    params={{ id }}
                    className="flex items-center text-sm text-primary hover:underline"
                >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Detail
                </Link>
            </CardContent>
        </Card>
    );
}
