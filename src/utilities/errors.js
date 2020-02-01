export class DeliveryAreaError extends Error {
	constructor (message) {
		super (message);
		this.name = "DeliveryAreaError";
		this.code = "DELIVERY_AREA_ERROR"
	}
}