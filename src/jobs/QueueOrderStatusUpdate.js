import {  getOrderStatusQty, ORDER_QTY_STATUS_UPDATED, ORDER_STATUS_UPDATED } from '../controller/order';
import Order from '../model/order';
import pubSub from '../services/pubsub';
import { QUEUE_ORDER_STATUS_UPDATED } from "./keys";

export default {
	key: QUEUE_ORDER_STATUS_UPDATED,
	options: {},
	async handle ({ data: { orderId } }) {
		const order = await Order.findByPk(orderId);
		if (!order) throw new Error('Pedido não encontrado')

		const companyId = order.get('companyId');
		const ordersStatusQty = await getOrderStatusQty(companyId);

		pubSub.publish(ORDER_STATUS_UPDATED, { updateOrderStatus: order });

		pubSub.publish(ORDER_QTY_STATUS_UPDATED, { updateOrderStatusQty: ordersStatusQty });
	}
}