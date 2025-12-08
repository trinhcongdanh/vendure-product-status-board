import { defineDashboardExtension } from '@vendure/dashboard';
import { LayoutGrid } from 'lucide-react';
import ProductStatusBoardPage from './pages/ProductStatusBoardPage.js';

export default defineDashboardExtension({
    routes: [
        {
            path: '/product-status-board',
            component: ProductStatusBoardPage,
            loader: () => ({
                breadcrumb: () => 'Product Status Board',
            }),
            navMenuItem: {
                sectionId: 'catalog',
                id: 'product-status-board',
                title: 'Product Status Board',
                icon: LayoutGrid,
            },
        },
    ],
});
