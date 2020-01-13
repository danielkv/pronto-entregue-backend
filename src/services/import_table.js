const tables = {
	companies: require('../model/companies'),
	companiesMeta: require('../model/companies_meta'),
	companiesUsers: require('../model/companies_users'),
	branches: require('../model/branches'),
	branchesPaymentMethods: require('../model/branches_payment_methods'),
	branchesMeta: require('../model/branches_meta'),
	branchesUsers: require('../model/branches_users'),
	deliveryAreas: require('../model/delivery_areas'),
	users: require('../model/users'),
	usersMeta: require('../model/users_meta'),
	productsCategories: require('../model/products_categories'),
	products: require('../model/products'),
	optionsGroups: require('../model/options_groups'),
	options: require('../model/options'),
	items: require('../model/items'),
}

export default async (table, data) => {
	return tables[table].bulkCreate(data);
}