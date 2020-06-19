import { where, fn, col, literal } from "sequelize";

import { pointFromCoordinates } from "../utilities/address";

class DeliveryAreaControl {
	
	/**
	 * Get area that will be used as price selectorto make the delivery
	 * it work either to company delivery and pe delivery
	 * 
	 * @param {Company} companyInstamce 
	 * @param {Array} location 
	 * @param {String} type 
	 */
	async getArea(companyInstamce, location, type='delivery') {
		const userPoint = pointFromCoordinates(location.coordinates);
		let area;

		if (type === 'peDelivery')
			area = await this.getPeArea(companyInstamce, userPoint);
		else
			area = await this.getCompanyArea(companyInstamce, userPoint);

		return area;
	}

	/**
	 * Get area that will be used as price selectorto make the delivery
	 * only for company deliveries
	 * 
	 * @param {Company} companyInstamce 
	 * @param {*} userPoint 
	 */
	async getCompanyArea(companyInstamce, userPoint) {
		const [deliveryArea] = await companyInstamce.getDeliveryAreas({
			order: [['radius', 'ASC']],
			limit: 1,
			where: where(fn('ST_Distance_Sphere', userPoint, col('center')), '<=', literal('radius')),
		});

		return deliveryArea;
	}

	/**
	 * Get area that will be used as price selectorto make the delivery
	 * only for pe deliveries
	 * 
	 * @param {Company} companyInstamce 
	 * @param {*} userPoint 
	 */
	async getPeArea(companyInstamce, userPoint) {
		const [deliveryArea] = await companyInstamce.getPeDeliveryAreas({
			order: [['radius', 'ASC']],
			limit: 1,
			where: where(fn('ST_Distance_Sphere', userPoint, col('center')), '<=', literal('radius')),
		});

		return deliveryArea;
	}
}

const DeliveryAreaController = new DeliveryAreaControl();

export default DeliveryAreaController;