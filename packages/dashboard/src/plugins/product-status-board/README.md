# Product Status Board Plugin

A Vendure Dashboard plugin that displays all products in a grid view, grouped by their status.

## Features

### Statistics Dashboard

- **Overview Cards**: 5 clickable stat cards showing Total, Active, Low Stock, Out of Stock, Disabled counts
- **Percentage Display**: Each status shows percentage of total products
- **Interactive Filter**: Click on any card to filter products by that status

### Core Features

- **Grid View Layout**: Responsive grid (1-4 columns) for visual product management
- **Status Grouping**: Products grouped by 4 status sections:
    - **Active**: enabled = true AND stock > 10
    - **Low Stock**: enabled = true AND 0 < stock <= 10
    - **Out of Stock**: enabled = true AND stock <= 0
    - **Disabled**: enabled = false
- **Product Cards**: Display thumbnail, name, status badge, stock count, and toggle switch
- **Quick Actions**: Enable/disable products directly from the card

### Search & Filter

- **Search**: Find products by name
- **Status Filter**: Filter by specific status (All, Active, Low Stock, Out of Stock, Disabled)

### Pagination

- **Page Size Options**: 10, 20, 50, or 100 items per page
- **Page Navigation**: Previous/Next buttons with page number indicators
- **Smart Pagination**: Ellipsis for large page counts

### Export

- **Export to CSV**: Download filtered products as CSV file
- **Smart Naming**: File name includes filter status and date

### UI States

- Loading state with spinner
- Error state with Retry button
- Empty state with clear filters option

## File Structure

```
product-status-board/
├── product-status-board.plugin.ts    # Backend plugin registration
├── index.ts                          # Plugin export
├── README.md                         # This file
└── dashboard/
    ├── index.tsx                     # Dashboard extension (routes, nav menu)
    ├── pages/
    │   └── ProductStatusBoardPage.tsx # Main page component
    ├── graphql/
    │   └── product-status-board.graphql.ts  # GraphQL query & mutation
    ├── utils/
    │   └── product-status.ts         # Helper functions (status, export CSV)
    └── components/
        ├── StatsSummary.tsx          # Statistics dashboard cards
        ├── StatusSection.tsx         # Section component for each status group
        ├── ProductCard.tsx           # Product card with toggle mutation
        └── Pagination.tsx            # Pagination controls component
```

## Tech Stack

- React + TypeScript
- Vendure Dashboard Plugin system
- TailwindCSS
- TanStack Query (React Query)
- Lucide React (icons)

## Usage

1. Import and add the plugin to your Vendure config:

```typescript
import { ProductStatusBoardPlugin } from './plugins/product-status-board';

export const config: VendureConfig = {
    plugins: [
        // ... other plugins
        ProductStatusBoardPlugin,
    ],
};
```

2. Navigate to Admin Dashboard → Catalog → Product Status Board

## GraphQL

### Query: Fetch Products

```graphql
query ProductStatusBoardList {
    products(options: { take: 1000 }) {
        items {
            id
            name
            slug
            createdAt
            enabled
            featuredAsset {
                preview
            }
            variants {
                stockLevels {
                    stockOnHand
                    stockAllocated
                }
            }
        }
    }
}
```

### Mutation: Toggle Product Status

```graphql
mutation UpdateProductEnabled($input: UpdateProductInput!) {
    updateProduct(input: $input) {
        id
        enabled
    }
}
```

## Checklist

### Required Features

- [x] UI Plugin for Vendure Admin
- [x] Sidebar menu item "Product Status Board" under Catalog
- [x] Click product → open product detail page
- [x] Fetch products with: id, name, slug, createdAt, enabled
- [x] Fetch inventory via variants.stockLevels
- [x] Fetch thumbnail via featuredAsset.preview
- [x] Status mapping from real data
- [x] Grid view layout (responsive 1-4 columns)
- [x] Product cards with name, thumbnail, status badge, stock, toggle
- [x] Grouped by 4 status sections
- [x] "Open Detail" button → deep link to product
- [x] Toggle enabled/disabled via Switch
- [x] Mutation updates UI via React Query
- [x] Loading state
- [x] Error state with Retry
- [x] Empty state

### Bonus Features

- [x] Search by product name
- [x] Filter by status
- [x] Pagination with page size options
- [x] Statistics Dashboard with clickable cards
- [x] Export to CSV

## Future Improvements

With more time, the following features could be added:

- [ ] **Bulk Actions**: Select multiple products and enable/disable in batch
- [ ] **Sort Options**: Sort by name, stock level, or created date
- [ ] **Virtual Scrolling**: Optimize performance for large datasets (1000+ products)
- [ ] **Optimistic Updates**: Update UI immediately on toggle, rollback if API fails
- [ ] **Keyboard Shortcuts**: J/K to navigate, E to toggle (Gmail/GitHub pattern)
- [ ] **Configurable Threshold**: Allow admin to configure LOW_STOCK_THRESHOLD via plugin options
- [ ] **Real-time Updates**: WebSocket/Subscription to sync changes from other users
- [ ] **Drag & Drop**: Reorder products within each section

## Evaluation

### Fit for Vendure Dashboard

This plugin fits well within the Vendure Dashboard because:

1. **Uses native components**: `Page`, `PageTitle`, `Card`, `Switch` from Vendure Dashboard
2. **Consistent UI/UX**: Follows dashboard design patterns and styling (TailwindCSS)
3. **Sidebar integration**: Menu item placed in "Catalog" section alongside Products, Facets
4. **Data fetching pattern**: Uses GraphQL API and React Query like other dashboard pages
5. **Deep linking**: Links to product detail using dashboard's router

### Strengths

| Aspect | Description |
|--------|-------------|
| **UX** | Statistics cards provide quick overview, clickable to filter |
| **Performance** | Client-side filtering/pagination, no API calls on each filter change |
| **Maintainability** | Separated components, utility functions, TypeScript throughout |
| **Accessibility** | Disabled states, focus rings, semantic HTML elements |

### Current Limitations

| Issue | Impact | Workaround |
|-------|--------|------------|
| Fetch all products (take: 1000) | Slow with large catalogs | Implement server-side pagination |
| No real-time sync | Stale data with multiple users | Manual refresh or add polling |
| Hardcoded LOW_STOCK_THRESHOLD | Not flexible | Could be configured via plugin options |

### Trade-offs

1. **Client-side vs Server-side pagination**: Chose client-side for smoother UX (instant filtering), but trade-off is slower initial load with large datasets.

2. **Grouped view vs Flat list**: Chose grouped view for easier status scanning, but more complex to paginate (sections may be split across pages).

3. **Optimistic vs Pessimistic updates**: Chose pessimistic (wait for API response) to ensure data consistency, but UX is not as instant as optimistic updates.
