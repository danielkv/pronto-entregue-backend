import OrderController, { ORDER_QTY_STATUS_UPDATED, ORDER_STATUS_UPDATED } from '../../controller/order';
import Order from '../../model/order';
import pubSub from '../../services/pubsub';

export async function setDeliveryMan({ data: { orderId } }) {
	const order = await Order.findByPk(orderId);
	if (!order) throw new Error('Pedido não encontrado')

	const companyId = order.get('companyId');
	const ordersStatusQty = await OrderController.getOrderStatusQty(companyId);

	//if delivery status is waitingDelviery

	pubSub.publish(ORDER_STATUS_UPDATED, { updateOrderStatus: order });

	pubSub.publish(ORDER_QTY_STATUS_UPDATED, { updateOrderStatusQty: ordersStatusQty });
}
