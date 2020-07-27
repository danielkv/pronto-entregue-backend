import moment from 'moment';

import CompanyController from '../controller/company';
import ConfigController from '../controller/config';
import OrderController, { ORDER_CREATED, ORDER_QTY_STATUS_UPDATED } from '../controller/order';
import UserController from '../controller/user';
import JobQueue from '../factory/queue';
import pubSub, { instanceToData } from '../services/pubsub';
import { ORDER_NOTIFICATION_LIMIT, ORDER_NOTIFICATION_INTERVAL, TIME_BEFORE_SCHEDULED_ORDER_NOTIFICATION } from '../utilities/config';
import { ORDER_UPDATED, DEVICE_TOKEN_META, DESKTOP_TOKEN_META } from '../utilities/notifications';

export default new class OrderEventsFactory {
	start() {
		/**
		 * Queue job to notify  after change order status
		 */
		OrderController.on('changeStatus', async ({ order, newStatus }) => {
			const orderId = order.get('id');
			const userId = order.get('userId');
			const companyId = order.get('companyId');

			// remove recurrent notification
			JobQueue.removeRepeatebleJob('notifications', `createOrder.${orderId}`);

			// send order data to subscriptions
			pubSub.publish(ORDER_UPDATED, { orderUpdated: instanceToData(order), companyId });
	
			// send order qtys to subscriptions
			const ordersStatusQty = await OrderController.getOrderStatusQty(companyId);
			pubSub.publish(ORDER_QTY_STATUS_UPDATED, { updateOrderStatusQty: ordersStatusQty });

			// check if notification message is not null
			const notificationMessage = OrderController.getNotificationMessage(orderId, newStatus)
			if (notificationMessage) {
				// create message data
				const message = {
					...notificationMessage,
					data: {
						...notificationMessage,
						redirect: {
							name: 'OrderRoutes',
							params: {
								screen: 'OrderScreen',
								params: { orderId }
							}
						},
						alertData: notificationMessage
					}
				}
				// get user token
				const tokens = await UserController.getTokensById([userId], DEVICE_TOKEN_META)

				// queue notification
				JobQueue.notifications.add('simpleNotification', { deviceTokens: tokens, message })
			}
		});

		/**
		 * Queue notifications for scheduled orders
		 * 
		 * @param {Object} param
		 */
		async function queueScheduledOrderNotification ({ oldOrder, order }) {
			const scheduledTo = order.get('scheduledTo')
			// check if order is scheduled
			if ((oldOrder && !oldOrder.scheduledTo) && !scheduledTo) return;

			const status = order.get('status');
			const userId = order.get('userId')
			const orderId = order.get('id');
			const companyId = order.get('companyId');
			const orderCreatedAt = order.get('createdAt');

			// jobIds
			const userJobId = `scheduledOrder.user.${orderId}`;
			const companyJobId = `scheduledOrder.company.${orderId}`;

			// remove previous queued notifications
			const userJob = await JobQueue.notifications.getJob(userJobId);
			if (userJob) userJob.remove();
			const companyJob = await JobQueue.notifications.getJob(companyJobId);
			if (companyJob) companyJob.remove();

			// check order status
			if (!['scheduled'].includes(status) || !scheduledTo) return;

			// calculate jo delay
			const timeBefore = await ConfigController.get(TIME_BEFORE_SCHEDULED_ORDER_NOTIFICATION);
			const jobDelay = moment(scheduledTo).subtract(timeBefore, 'minutes').diff(moment(), 'milliseconds');

			// do not queue notifications in this case
			if (jobDelay < 0) return;

			const userNotificationMessage = {
				title: 'Você tem um pedido agendado para alguns instantes',
				body: `O pedido #${orderId} foi agendado ${moment(orderCreatedAt).fromNow()}. Fique no aguardo das notificações pra saber quando ele estiver a caminho 🤩`
			}

			const userMessage = {
				...userNotificationMessage,
				data: {
					...userNotificationMessage,
					redirect: {
						name: 'OrderRoutes',
						params: {
							screen: 'OrderScreen',
							params: { orderId }
						}
					},
					alertData: userNotificationMessage
				}
			}

			// queue user notification
			const userTokens = await UserController.getTokensById([userId], DEVICE_TOKEN_META);
			JobQueue.notifications.add(`simpleNotification.scheduled.${orderId}`, { deviceTokens: userTokens, message: userMessage }, { delay: jobDelay, jobId: userJobId })

			const companyNotificationMessage = {
				title: 'Você tem um pedido agendado para alguns instantes',
				body: `O pedido #${orderId} foi agendado ${moment(orderCreatedAt).fromNow()}. Enviamos essa notifição apenas pra você lembrar do pedido 😊`
			}
		
			const companyMessage = {
				...companyNotificationMessage,
				data: {
					...companyNotificationMessage,
					alertData: companyNotificationMessage
				}
			}
		
			// queue company notifications
			const companyDeviceTokens = await CompanyController.getUserTokens(companyId, DEVICE_TOKEN_META);
			const companyDesktopTokens = await CompanyController.getUserTokens(companyId, DESKTOP_TOKEN_META);
			JobQueue.notifications.add(`simpleNotification.scheduled.${orderId}`, { deviceTokens: companyDeviceTokens, desktopTokens: companyDesktopTokens, message: companyMessage }, { delay: jobDelay, jobId: companyJobId });
		}
		/**
		 * Schedule notification for scheduled orders
		 */
		OrderController.on('update', queueScheduledOrderNotification);
		OrderController.on('changeStatus', queueScheduledOrderNotification);

		/**
		 * Notify company (pubsub subscriptions) when order is created
		 */
		OrderController.on('create', async ({ order, company })=>{
			const orderId = order.get('id')
			const companyId = company.get('id');

			// publish pubsub
			pubSub.publish(ORDER_CREATED, { orderCreated: instanceToData(order), companyId });

			// setup data and config
			const limit = await ConfigController.get(ORDER_NOTIFICATION_LIMIT)
			const interval = await ConfigController.get(ORDER_NOTIFICATION_INTERVAL)
			const data = { companyId, orderId }
			
			// queue order notifications
			JobQueue.notifications.add(`createOrder.first.${orderId}`, data)
			JobQueue.notifications.add(`createOrder.${orderId}`, data, { repeat: { limit, every: interval, count: 0 } })
		});

		console.log(' - Setup Order events')
	}
}


