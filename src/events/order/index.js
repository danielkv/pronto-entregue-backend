import OrderController, {
    ORDER_QTY_STATUS_UPDATED,
} from '../../controller/order';
import UserController from '../../controller/user';
import JobQueue from '../../factory/queue';
import pubSub, { instanceToData } from '../../services/pubsub';
import { RedirectService } from '../../services/redirect.service';
import {
    ORDER_UPDATED,
    DEVICE_TOKEN_META,
} from '../../utilities/notifications';
import createClosedBuyOrder from './createClosedBuyOrder';
import createDefaultOrder from './createDefaultOrder';
import createScheduledOrder from './createScheduledOrder';

export default new (class OrderEventsFactory {
    start() {
        /**
         * Queue job to notify  after change order status
         */
        OrderController.on('changeStatus', async ({ order, newStatus }) => {
            const orderId = order.get('id');
            const userId = order.get('userId');
            const companyId = order.get('companyId');

            // remove recurrent notification
            JobQueue.removeRepeatebleJob(
                'notifications',
                `createOrder.${orderId}`,
            );

            // send order data to subscriptions
            pubSub.publish(ORDER_UPDATED, {
                orderUpdated: instanceToData(order),
                companyId,
            });

            // send order qtys to subscriptions
            const ordersStatusQty = await OrderController.getOrderStatusQty(
                companyId,
            );
            pubSub.publish(ORDER_QTY_STATUS_UPDATED, {
                updateOrderStatusQty: ordersStatusQty,
            });

            // check if notification message is not null
            const notificationMessage = OrderController.getNotificationMessage(
                orderId,
                newStatus,
            );
            if (notificationMessage) {
                // create message data
                const message = {
                    ...notificationMessage,
                    data: {
                        ...notificationMessage,
                        redirect: new RedirectService('order', {
                            orderId,
                        }),
                        alertData: notificationMessage,
                    },
                };
                // get user token
                const tokens = await UserController.getTokensById(
                    [userId],
                    DEVICE_TOKEN_META,
                );

                // queue notification
                JobQueue.notifications.add('simpleNotification', {
                    deviceTokens: tokens,
                    message,
                });
            }
        });

        /**
         * Schedule notification for scheduled orders
         */
        /* OrderController.on('update', createScheduledOrder);
		OrderController.on('changeStatus', createScheduledOrder); */

        /**
         * Notify company (pubsub subscriptions) when order is created
         */
        OrderController.on('create', (args) => {
            const order = args.order;

            // scheduledTo
            if (order.get('scheduledTo')) return createScheduledOrder(args);

            // closed buy
            if (args.closedBuy) return createClosedBuyOrder(args);

            // default order
            createDefaultOrder(args);
        });

        console.log(' - Setup Order events');
    }
})();
