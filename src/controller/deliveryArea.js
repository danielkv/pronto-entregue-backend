import DataLoader from 'dataloader';
import _ from 'lodash';
import Sequelize from 'sequelize';

import ConfigEntity from '../entities/Config';
import DB from '../model';
import GMaps from '../services/googleMapsClient';
import { pointFromCoordinates, calculateDistance } from '../utilities/address';
import {
    DELIVERY_PRICE_PER_KM,
    DELIVERY_PE_MIN_PRICE,
} from '../utilities/config';

const configEntity = new ConfigEntity();

class DeliveryAreaControl {
    constructor() {
        this.deliveryLoader = new DataLoader(
            async (keys) => {
                const companyIds = keys.map((k) => k.companyId);
                const location = keys[0].location;
                if (!location)
                    throw new Error(
                        'Não é possível retornar uma área de entrega sem uma localização',
                    );
                const userPoint = pointFromCoordinates(location.coordinates);

                const areas = await DB.deliveryArea.findAll({
                    where: [
                        { companyId: companyIds, active: true },
                        Sequelize.where(
                            Sequelize.fn(
                                'ST_Distance_Sphere',
                                userPoint,
                                Sequelize.col(`center`),
                            ),
                            '<=',
                            Sequelize.col(`radius`),
                        ),
                    ],
                    order: [
                        [Sequelize.col('companyId'), 'ASC'],
                        [Sequelize.col('radius'), 'ASC'],
                    ],
                });

                const grouped = _.groupBy(areas, 'companyId');
                return companyIds.map((id) => grouped[id] || []);
            },
            { cache: false, cacheKeyFn: (value) => JSON.stringify(value) },
        );

        this.viewLoader = new DataLoader(
            async (keys) => {
                const companyIds = keys.map((k) => k.companyId);
                const location = keys[0].location;
                if (!location)
                    throw new Error(
                        'Não é possível retornar uma área de vizualização sem uma localização',
                    );
                const userPoint = pointFromCoordinates(location.coordinates);

                const areas = await DB.viewArea.findAll({
                    where: [
                        { companyId: companyIds, active: true },
                        Sequelize.where(
                            Sequelize.fn(
                                'ST_Distance_Sphere',
                                userPoint,
                                Sequelize.col(`center`),
                            ),
                            '<=',
                            Sequelize.col(`radius`),
                        ),
                    ],
                    order: [
                        [Sequelize.col('companyId'), 'ASC'],
                        [Sequelize.col('radius'), 'ASC'],
                    ],
                });

                const grouped = _.groupBy(areas, 'companyId');
                return companyIds.map((id) => grouped[id] || []);
            },
            { cache: false, cacheKeyFn: (value) => JSON.stringify(value) },
        );
    }

    /**
     * Get area that will be used as price selectorto make the delivery
     * it work either to company delivery and pe delivery
     *
     * @param {Company} companyInstamce
     * @param {Array} userLocation
     * @param {String} type
     */
    async getArea(companyInstamce, userLocation, type = 'delivery') {
        let area;

        if (type === 'peDelivery')
            area = await this.getPeArea(companyInstamce, userLocation);
        else [area] = await this.getCompanyAreas(companyInstamce, userLocation);

        return area;
    }

    /**
     * Get area that will be used as price selectorto make the delivery
     * only for company deliveries
     *
     * @param {Company} companyInstance
     * @param {*} userLocation
     */
    getCompanyAreas(companyInstance, userLocation) {
        const companyId = companyInstance.get('id');
        return this.deliveryLoader.load({ companyId, location: userLocation });
    }

    /**
     * Get area that will be used as price selectorto make the delivery
     * only for pe deliveries
     *
     * @param {Company} companyInstance
     * @param {Object} userLocation
     */
    async getPeArea(companyInstance, userLocation) {
        const companyId = companyInstance.get('id');

        const viewAreas = await this.viewLoader.load({
            companyId,
            location: userLocation,
        });
        if (!viewAreas.length) return null;

        // get company address
        const companyAddress = await companyInstance.getAddress();

        // get location coordinates
        const companyLocation = companyAddress.get('location').coordinates;

        // get straight distance between user location and company
        const distance = calculateDistance(
            { latitude: companyLocation[0], longitude: companyLocation[1] },
            {
                latitude: userLocation.coordinates[0],
                longitude: userLocation.coordinates[1],
            },
        );

        // calculate price
        const price = await this.calculatePeDeliveryPrice(distance);

        return {
            id: _.uniqueId('peDelivery_'),
            name: 'peDelivery',
            type: 'peDelivery',
            distance,
            price,
        };
    }

    async calculateRealPrice(origin, destination) {
        console.log('calculo de rota');

        let distance;

        try {
            distance = await this.calculateDrivingDistance(origin, destination);
        } catch (err) {
            distance = calculateDistance(
                { latitude: origin[0], longitude: origin[1] },
                { latitude: destination[0], longitude: destination[1] },
            );
        }

        return await this.calculatePeDeliveryPrice(distance);
    }

    async calculateDrivingDistance(origin, destination) {
        const distanceResponse = await GMaps.directions({
            params: {
                key: process.env.GMAPS_KEY,
                origin: origin,
                destination: destination,
            },
        });

        const distance = distanceResponse.data.routes[0].legs[0].distance.value;

        console.log('directions API');

        return distance;
    }

    /**
     * Calculate de price BRL
     * @param {Number} distance in meters
     */
    async calculatePeDeliveryPrice(distance) {
        // get price per KM config
        const pricePerKM = await configEntity.get(DELIVERY_PRICE_PER_KM);

        // get delivery minimum price
        const minPrice = await configEntity.get(DELIVERY_PE_MIN_PRICE);

        // convert to price per meter
        const pricePerMeter = pricePerKM / 1000;

        // calculate price
        const finalPrice = Math.max(
            Math.ceil(distance * pricePerMeter),
            minPrice,
        );

        // return result
        return finalPrice;
    }
}

const DeliveryAreaController = new DeliveryAreaControl();

export default DeliveryAreaController;
