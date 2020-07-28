import DataLoader from "dataloader";
import moment from "moment";
import Sequelize from "sequelize";

import * as CompanyDefault from '../default/company';
import { remap } from "../loaders/remap";
import DB from "../model";
import Company from "../model/company";
import CompanyMeta from "../model/companyMeta";
import User from "../model/user";
import UserMeta from "../model/userMeta";
import { getSQLPagination, deserealizeConfig, serealizeConfig } from "../utilities";
import { pointFromCoordinates } from "../utilities/address";
import { DELIVERY_TYPE_META } from "../utilities/company";

class CompanyControl {
	constructor() {
		this.loader = new DataLoader(async keys => {
			const location = keys[0].location;
			const ids = keys.map(k => k.id)

			let query = { where: { id: ids } }

			if (location) query = this.includeQueryLocation(location, query, false)

			const companies = await DB.company.findAll(query)

			return remap(ids, companies);
		}, { cache: false, cacheKeyFn: (value)=>JSON.stringify(value) })

		this.metaLoader = new DataLoader(async values => {
			const companyIds = values.map(k => k.companyId);
			const keys = values.map(k => k.key);
			const metas = await DB.companyMeta.findAll({
				where: { key: keys, companyId: companyIds }
			});

			return values.map(v => {
				const config = metas.find(c => c.companyId == v.companyId && c.key == v.key);
				if (config) return config;

				return null;
			});
		}, { cache: false })
	}

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

	async getCompany(id, location) {
		const company = await this.loader.load({ id, location });

		if (!company) throw new Error('Estabelecimetno não encontrado')

		return company;
	}

	/**
	 * Return companies
	 * 
	 * @param {Object} filter 
	 * @param {Object} location 
	 */
	getCompanies(where, location, pagination) {
		let query = {
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
			query = this.includeQueryLocation(location, query);

			query.order = [[Sequelize.col('isOpen'), 'DESC'], [Sequelize.col('distance'), 'ASC']]
		}
			
		return DB.company.findAll(query);
	}

	/**
	 * Include location in Sequelize query
	 * @param {Object} query 
	 * @param {GeoPoint} location 
	 */
	includeQueryLocation(location, query={}, filterLocation=true) {
		const userPoint = pointFromCoordinates(location.coordinates);

		const include = query.include ? query.include : []

		query.include = [
			...include,
			DB.address,

			this.includeArea(userPoint, 'deliveryArea', 'deliveryAreas'),
			this.includeArea(userPoint, 'viewArea', 'viewAreas')
		]

		if (filterLocation) {
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
		}

		const attributesInclude = query.attributes && query.attributes.include ? query.attributes.include : []
		query.attributes = { include: [...attributesInclude, [Sequelize.fn('ST_Distance_Sphere', userPoint, Sequelize.col('address.location')), 'distance']] }

		query.subQuery = false;

		return query;
	}

	/**
	 * Set and return values from config table
	 * @param {String} key 
	 */
	setConfigs(companyId, data) {
		return Promise.all(data.map(config => {
			return this.setConfig(companyId, config.key, config.value, config.type)
		}))
	}

	/**
	 * Set and return values from config table
	 * @param {*} companyId 
	 * @param {*} key 
	 * @param {*} value 
	 * @param {*} type 
	 */
	async setConfig(companyId, key, value, type) {
		const meta = await DB.companyMeta.findOne({ where: { companyId, key } })
		if (!meta) {
			const valueSave = serealizeConfig(value, type);
			const created = await DB.companyMeta.create({ key, companyId, value: valueSave, type });
			return deserealizeConfig(created.value, type);
		} else {
			const typeSave = type ? type : meta.type;
			const valueSave = serealizeConfig(value, typeSave);
			const updated = await meta.update({ key, value: valueSave, type: typeSave });
			return updated.value;
		}
	}

	/**
	 * Returns values from config table
	 * @param {String} key 
	 */
	async getConfig(companyId, key) {
		const config = await this.metaLoader.load({ key, companyId })
		if (config) {
			let typeDeserialize = config.type;
			if (!config.type) {
				switch (key) {
					case 'businessHours':
						typeDeserialize = 'json'
						break;
					default:
						typeDeserialize = 'string'
				}
			}
			return deserealizeConfig(config.value, typeDeserialize);
		}

		//check for default value
		const defaultValue = CompanyDefault[key];
		if (defaultValue) return defaultValue();
		
		return;
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