import DataLoader from "dataloader";
import { Sequelize } from "sequelize";

import DB from "../model";

export default new DataLoader(async deliveryMenId => {
	const allDeliveries = await DB.delivery.findAll({
		where: { deliveryManId: deliveryMenId, status: { [Sequelize.Op.not]: ['canceled', 'delivered'] } }
	});

	const result = deliveryMenId.map(deliveryManId => {
		const deliveries = allDeliveries.filter(delivery => delivery.deliveryManId == deliveryManId);
		return deliveries;
	});

	return result;
}, { cache: false })