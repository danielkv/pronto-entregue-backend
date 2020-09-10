import DataLoader from 'dataloader';
import _ from 'lodash';
import Sequelize from 'sequelize';

import ConfigEntity from '../entities/Config';
import DB from '../model';
import { pointFromCoordinates, calculateDistance } from '../utilities/address';
import {
    DELIVERY_PRICE_PER_KM,
    DELIVERY_PE_MIN_PRICE,
} from '../utilities/config';
import GMaps from '../services/googleMapsClient';

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
     * @param {Company} companyInstamce
     * @param {*} userLocation
     */
    getCompanyAreas(companyInstamce, userLocation) {
        const companyId = companyInstamce.get('id');
        return this.deliveryLoader.load({ companyId, location: userLocation });
    }

    /**
     * Get area that will be used as price selectorto make the delivery
     * only for pe deliveries
     *
     * @param {Company} companyInstamce
     * @param {Object} userLocation
     */
    async getPeArea(companyInstamce, userLocation) {
        const companyId = companyInstamce.get('id');

        const viewAreas = await this.viewLoader.load({
            companyId,
            location: userLocation,
        });
        if (!viewAreas.length) return null;

        // get company address
        const companyAddress = await companyInstamce.getAddress();

        // get location coordinates
        const companyLocation = companyAddress.get('location').coordinates;

        // get distance between user location and company
        //const distance = calculateDistance({ latitude: companyLocation[0], longitude: companyLocation[1] }, { latitude: userLocation.coordinates[0], longitude: userLocation.coordinates[1] })
        let distance;

        try {
            const distanceResponse = await GMaps.directions({
                params: {
                    key: process.env.GMAPS_KEY,
                    origin: [companyLocation[0], companyLocation[1]],
                    destination: [
                        userLocation.coordinates[0],
                        userLocation.coordinates[1],
                    ],
                },
            });
            distance = distanceResponse.data.routes[0].legs[0].distance.value;
        } catch (_) {
            distance = calculateDistance(
                { latitude: companyLocation[0], longitude: companyLocation[1] },
                {
                    latitude: userLocation.coordinates[0],
                    longitude: userLocation.coordinates[1],
                },
            );
        }

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
