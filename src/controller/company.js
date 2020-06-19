import CompanyMeta from "../model/companyMeta";

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
}

const CompanyController = new CompanyControl();

export default CompanyController;