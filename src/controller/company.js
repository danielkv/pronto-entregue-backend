import moment from "moment";
import Sequelize from "sequelize";

import DB from "../model";
import Company from "../model/company";
import CompanyMeta from "../model/companyMeta";
import User from "../model/user";
import UserMeta from "../model/userMeta";
import { getSQLPagination } from "../utilities";
import { pointFromCoordinates } from "../utilities/address";
import { DELIVERY_TYPE_META } from "../utilities/company";

class CompanyControl {
	/**
	 * Returns delivery type is enabled in company: delivery | peDelivery
	 * @param {ID} companyId 
	 */
	async getDeliveryType (companyId) {
		const meta = await CompanyMeta.findOne({ where: { companyId, key: DELIVERY_TYPE_META } })
		if (!meta) return 'delivery';

		return meta.get('value');
	}

	/**
	 * Return user tokens of the company
	 * 
	 * @param {ID} companyId
	 */
	async getUserTokens(companyId, metaType) {
		const tokenMetas = await UserMeta.findAll({
			where: { key: metaType },
			include: [
				{
					model: User,
					required: true,
					include: [{
						model: Company,
						where: { id: companyId },
						required: true
					}]
				}
			]
		});
		if (!tokenMetas.length) return [];
	
		// reduce tokens
		return tokenMetas.reduce((allTokens, meta) =>{
			const tokens = JSON.parse(meta.value);
				
			return [...allTokens, ...tokens];
		}, []);
	}

	/**
	 * Return companies
	 * 
	 * @param {Object} filter 
	 * @param {Object} location 
	 */
	getCompanies(where, location, pagination) {
		const query = {
			attributes: { include: [this.isOpenAttribute('metas.value')] },
			where,
			include: [DB.companyType, { model: DB.companyMeta, where: { key: 'businessHours' }, required: false }],
			group: Sequelize.col('company.id'),
			limit: 10,
			subQuery: false,
			order: [[Sequelize.col('isOpen'), 'DESC']]
		}

		if (pagination) {
			const queryPagination = getSQLPagination(pagination);
			query.offset = queryPagination.offset;
			query.limit = queryPagination.limit;
		}

		if (location) {
			const userPoint = pointFromCoordinates(location.coordinates);

			query.include = [
				...query.include,
				DB.address,

				this.includeArea(userPoint, 'deliveryArea', 'deliveryAreas'),
				this.includeArea(userPoint, 'viewArea', 'viewAreas')
			]

			const addToQuery = {
				[Sequelize.Op.or]: [
					Sequelize.where(Sequelize.col('deliveryAreas.id'), Sequelize.Op.not, null),
					Sequelize.where(Sequelize.col('viewAreas.id'), Sequelize.Op.not, null)
				]
			}

			if (query.where)
				query.where = [query.where, addToQuery];
			else
				query.where = addToQuery

			query.attributes.include = [...query.attributes.include, [Sequelize.fn('ST_Distance_Sphere', userPoint, Sequelize.col('address.location')), 'distance']]

			query.order = [[Sequelize.col('isOpen'), 'DESC'], [Sequelize.col('distance'), 'ASC']]
		}
			
		return DB.company.findAll(query);
	}

	/**
	 * Returns transformed values from config table
	 * @param {String} key 
	 */
	async getConfig(companyId, key) {
		const row = await DB.companyMeta.findOne({ where: { key, companyId } })
		if (!row) return;
		
		return row.get('value');
	}

	includeArea(userPoint, model, type) {
		return {
			model: DB[model],
			where: [
				Sequelize.where(Sequelize.fn('ST_Distance_Sphere', userPoint, Sequelize.col(`${type}.center`)), '<=', Sequelize.col(`${type}.radius`)),
				Sequelize.where(Sequelize.col(`${type}.active`), Sequelize.Op.is, true)
			],
			required: false
		}
	}

	isOpenAttribute(column='') {
		const now = moment();
		const weekDay = now.format('d');
	
		const objectDay = `JSON_EXTRACT(${column}, '$[${weekDay}]')`;
	
		const hour1 = `JSON_EXTRACT(${objectDay}, '$.hours[0]')`;
		const hour2 = `JSON_EXTRACT(${objectDay}, '$.hours[2]')`;
	
		const from1 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour1}, '$.from') ))`;
		const to1 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour1}, '$.to') ))`;
	
		const from2 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour2}, '$.from') ))`;
		const to2 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour2}, '$.to') ))`;
	
		const timeNow = 'TIME(now())';
	
		const isOpen = Sequelize.literal(`IF(IF(${hour1} IS NOT NULL, ${timeNow} BETWEEN ${from1} AND ${to1}, false) OR IF(${hour2} IS NOT NULL, ${timeNow} BETWEEN ${from2} AND ${to2}, false), true, false)`)
	
		return [isOpen, 'isOpen'];
	}

}

const CompanyController = new CompanyControl();

export default CompanyController;