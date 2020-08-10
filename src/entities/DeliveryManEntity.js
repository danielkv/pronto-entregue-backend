import userDeliveryLoader from "../loaders/userOpenDeliveriesLoader";

class DeliveryManEntity {
	getOpenDeliveries(userId) {
		return userDeliveryLoader.load(userId);
	}
}

export default new DeliveryManEntity();