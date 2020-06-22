import Company from "../model/company";
import CompanyMeta from "../model/companyMeta";
import User from "../model/user";
import UserMeta from "../model/userMeta";

class CompanyControl {
	/**
	 * Returns delivery type is enabled in company: delivery | peDelivery
	 * @param {ID} companyId 
	 */
	async getDeliveryType (companyId) {
		const meta = await CompanyMeta.findOne({ where: { companyId, key: 'deliveryType' } })
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
}

const CompanyController = new CompanyControl();

export default CompanyController;