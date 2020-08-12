import { ORDER_CREATED } from "../../controller/order";
import JobQueue from "../../factory/queue";
import configLoader from "../../loaders/configLoader";
import pubSub, { instanceToData } from "../../services/pubsub";
import { ORDER_NOTIFICATION_LIMIT, ORDER_NOTIFICATION_INTERVAL } from "../../utilities/config";

export default async function createDefaultOrder({ order, company }) {
	const orderId = order.get('id')
	const companyId = company.get('id');

	// publish pubsub
	pubSub.publish(ORDER_CREATED, { orderCreated: instanceToData(order), companyId });

	// setup data and config
	const [limit, interval] = await configLoader.loadMany([ORDER_NOTIFICATION_LIMIT, ORDER_NOTIFICATION_INTERVAL])
	const data = { companyId, orderId }
		
	// queue order notifications
	JobQueue.notifications.add(`createOrder.first.${orderId}`, data)
	JobQueue.notifications.add(`createOrder.${orderId}`, data, { repeat: { limit, every: interval, count: 0 } })
}