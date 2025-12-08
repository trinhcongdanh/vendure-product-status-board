import { graphql } from '@/vdb/graphql/graphql.js';

export const productStatusBoardListDocument = graphql(`
    query ProductStatusBoardList($options: ProductListOptions) {
        products(options: $options) {
            items {
                id
                createdAt
                name
                slug
                enabled
                featuredAsset {
                    id
                    preview
                }
                variants {
                    id
                    name
                    stockLevels {
                        stockOnHand
                        stockAllocated
                    }
                }
            }
            totalItems
        }
    }
`);

export const updateProductEnabledDocument = graphql(`
    mutation UpdateProductEnabled($input: UpdateProductInput!) {
        updateProduct(input: $input) {
            id
            enabled
        }
    }
`);
