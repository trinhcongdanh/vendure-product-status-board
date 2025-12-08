import { VendureConfig } from '@vendure/core';

import { ProductStatusBoardPlugin } from './src/plugins/product-status-board/index.js';

export const config: VendureConfig = {
    apiOptions: {
        port: 3000,
    },
    authOptions: {
        tokenMethod: 'bearer',
    },
    dbConnectionOptions: {
        type: 'postgres',
    },
    paymentOptions: {
        paymentMethodHandlers: [],
    },
    plugins: [ProductStatusBoardPlugin],
};
