class DeliveryManFactory {
	userIsDeliveryMan(userInstance) {
		return userInstance.get('role') === 'deliveryMan';
	}

	isWorker() {

	}

	hasDeliveryMan(companyId) {

	}

	getCompanyDeliveryMen(companyId) {

	}

	
}

const DeliveryManController = new DeliveryManFactory();

export default DeliveryManController;