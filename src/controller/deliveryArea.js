import _ from "lodash";
import { where, fn, col, literal } from "sequelize";

import { pointFromCoordinates, calculateDistance } from "../utilities/address";
import { DELIVERY_PRICE_PER_KM, DELIVERY_PE_MIN_PRICE } from "../utilities/config";
import ConfigController from "./config";

class DeliveryAreaControl {
	
	/**
	 * Get area that will be used as price selectorto make the delivery
	 * it work either to company delivery and pe delivery
	 * 
	 * @param {Company} companyInstamce 
	 * @param {Array} userLocation 
	 * @param {String} type 
	 */
	async getArea(companyInstamce, userLocation, type='delivery') {
		
		let area;

		if (type === 'peDelivery')
			area = await this.getPeArea(companyInstamce, userLocation);
		else
			area = await this.getCompanyArea(companyInstamce, userLocation);

		return area;
	}

	/**
	 * Get area that will be used as price selectorto make the delivery
	 * only for company deliveries
	 * 
	 * @param {Company} companyInstamce 
	 * @param {*} userLocation 
	 */
	async getCompanyArea(companyInstamce, userLocation) {
		const userPoint = pointFromCoordinates(userLocation.coordinates);

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
	 * @param {Object} userLocation 
	 */
	async getPeArea(companyInstamce, userLocation) {
		// get company address
		const companyAddress = await companyInstamce.getAddress();

		// get location coordinates
		const companyLocation = companyAddress.get('location').coordinates
		
		// get distance between user location and company
		const distance = calculateDistance({ latitude: companyLocation[0], longitude: companyLocation[1] }, { latitude: userLocation.coordinates[0], longitude: userLocation.coordinates[1] })

		// calculate price
		const price = await this.calculatePeDeliveryPrice(distance);

		return {
			id: _.uniqueId('peDelivery_'),
			name: 'peDelivery',
			distance,
			price
		};
	}
	
	/**
	 * Calculate de price BRL
	 * @param {Number} distance in meters
	 */
	async calculatePeDeliveryPrice(distance) {
		// get price per KM config
		const pricePerKM = await ConfigController.get(DELIVERY_PRICE_PER_KM);

		// get delivery minimum price
		const minPrice = await ConfigController.get(DELIVERY_PE_MIN_PRICE);

		// convert to price per meter
		const pricePerMeter = pricePerKM / 1000;

		// calculate price
		const finalPrice = Math.max(Math.ceil(distance * pricePerMeter), minPrice);

		// return result
		return finalPrice;
	}
}

const DeliveryAreaController = new DeliveryAreaControl();

export default DeliveryAreaController;