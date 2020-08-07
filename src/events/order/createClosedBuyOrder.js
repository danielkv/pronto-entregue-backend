import ConfigController from "../../controller/config";
import { ORDER_CREATED } from "../../controller/order";
import JobQueue from "../../factory/queue";
import pubSub, { instanceToData } from "../../services/pubsub";
import { ORDER_NOTIFICATION_LIMIT, ORDER_NOTIFICATION_INTERVAL } from "../../utilities/config";

export default async function createClosedBuyOrder({ order, company }) {
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
}