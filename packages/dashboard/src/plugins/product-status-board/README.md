# Product Status Board Plugin

A Vendure Dashboard plugin that displays all products in a grid view, grouped by their status.

## Author Notes

> **Candidate:** [Tên ứng viên]
> **Time spent:** ~X hours
> **Experience level:** [Junior/Mid/Senior]

### Why I Built It This Way

Khi tiếp cận bài test này, tôi đã cân nhắc một số design decisions:

1. **Grid View thay vì Table View**: Tôi chọn grid vì nó trực quan hơn cho việc quản lý inventory - người dùng có thể nhanh chóng scan qua hình ảnh sản phẩm và status badges. Trong kinh nghiệm làm việc với các e-commerce admin panels, tôi nhận thấy visual overview giúp warehouse staff làm việc hiệu quả hơn.

2. **Grouped by Status**: Thay vì chỉ filter, tôi group products theo status để user thấy được "big picture" - bao nhiêu sản phẩm đang active, bao nhiêu cần restock, etc.

3. **Inline Toggle**: Cho phép enable/disable product ngay trên card mà không cần mở detail page - giảm số clicks cần thiết cho common operations.

### Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Tính stock từ multiple variants + locations | Aggregate `stockOnHand - stockAllocated` across all variants và stock locations |
| Real-time UI update sau mutation | Sử dụng React Query's `invalidateQueries` để refetch data |
| Responsive layout cho nhiều screen sizes | CSS Grid với responsive breakpoints (1-4 columns) |

### What I Would Do Differently With More Time

Nếu có thêm thời gian, tôi sẽ:
- Thêm **virtual scrolling** cho performance với large datasets (đã từng implement với `react-window` trong project trước)
- Implement **optimistic updates** cho toggle switch để UX mượt hơn
- Thêm **keyboard shortcuts** (J/K để navigate, E để toggle) - pattern học từ Gmail/GitHub

---

## Features Completed

### Plugin & Routing

- [x] Created UI Plugin for Vendure Admin (`ProductStatusBoardPlugin`)
- [x] Added sidebar menu item "Product Status Board" under Catalog section
- [x] Click on product card opens product detail page (deep link)

### Data from GraphQL

- [x] Fetch products with required fields: `id`, `name`, `slug`, `createdAt`, `enabled`
- [x] Fetch inventory data via `variants.stockLevels` (stockOnHand, stockAllocated)
- [x] Fetch product thumbnail via `featuredAsset.preview`

### Status Mapping

- [x] Status calculated from real data:
    - **Active**: enabled = true AND stock > 10
    - **Low Stock**: enabled = true AND 0 < stock <= 10
    - **Out of Stock**: enabled = true AND stock <= 0
    - **Disabled**: enabled = false

### UI: Product Status Board

- [x] Grid view layout (responsive: 1-4 columns)
- [x] Product cards with:
    - Product name
    - Thumbnail (placeholder icon if no image)
    - Status badge (color-coded)
    - Stock count
    - Enabled toggle switch
    - "Open Detail" link
- [x] Grouped by 4 status sections: Active / Low Stock / Out of Stock / Disabled

### Interactions

- [x] "Open Detail" button → navigates to `/products/:id`
- [x] Toggle enabled/disabled via Switch component
- [x] Mutation updates UI via React Query (`invalidateQueries`)
- [x] Toast notifications on success/error

### UI States

- [x] Loading state (spinner + text)
- [x] Error state with Retry button
- [x] Empty state (when no products)

## Tech Stack

- React + TypeScript
- Vendure Dashboard Plugin system
- TailwindCSS
- TanStack Query (React Query)
- Lucide React (icons)

## File Structure

```
product-status-board/
├── product-status-board.plugin.ts    # Backend plugin registration
├── index.ts                          # Plugin export
├── README.md                         # This file
└── dashboard/
    ├── index.tsx                     # Dashboard extension (routes, nav menu)
    ├── ProductStatusBoardPage.tsx    # Main page component
    ├── product-status-board.graphql.ts  # GraphQL query & mutation
    ├── utils/
    │   └── product-status.ts         # Helper functions (status calculation)
    └── components/
        ├── StatusSection.tsx         # Section component for each status group
        └── ProductCard.tsx           # Product card with toggle mutation
```

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

## Future Improvements (Nice to Have)

- [ ] Add search/filter functionality
- [ ] Add pagination for large product catalogs
- [ ] Add "Mark as back in stock" button (bulk update stock)
- [ ] Add drag-and-drop to reorder products
- [ ] Add export to CSV functionality
- [ ] Add statistics summary (charts/graphs)
- [ ] Configurable LOW_STOCK_THRESHOLD via plugin options
- [ ] Add sorting options (by name, stock, date)
- [ ] Real-time updates via WebSocket/subscriptions

## Evaluation Notes

### Fit for Dashboard

This plugin fits well within the Vendure Dashboard because:

- Uses native Vendure Dashboard components (`Page`, `PageTitle`, `Card`, `Switch`)
- Follows existing UI patterns and styling (TailwindCSS)
- Integrates seamlessly with the sidebar navigation
- Uses the same data fetching patterns (GraphQL + React Query)

### Code Quality

- Components are separated by responsibility
- Reusable utility functions for status logic
- TypeScript for type safety
- No duplicate logic between components

### UX Considerations

- Responsive grid layout adapts to screen size
- Visual feedback on interactions (loading states, toasts)
- Color-coded status badges for quick scanning
- Grouped sections make it easy to find products by status
