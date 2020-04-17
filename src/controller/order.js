import Order from "../model/order";
import PaymentMethod from "../model/paymentMethod";
import User from "../model/user";

// pubsub vars
export const ORDER_CREATED = 'ORDER_CREATED';

export async function pubSubPublishOrder(pubsub, orderId) {

	const order = await Order.findOne({
		where: { id: orderId },
		include: [User, PaymentMethod]
	});

	pubsub.publish(ORDER_CREATED, { orderCreated: order });
}