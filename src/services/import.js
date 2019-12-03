const Companies = require('../model/companies');
const CompaniesMeta = require('../model/companies_meta');
const CompaniesUsers = require('../model/companies_users');
const Branches = require('../model/branches');
const BranchesPaymentMethods = require('../model/branches_payment_methods');
const BranchesMeta = require('../model/branches_meta');
const BranchesUsers = require('../model/branches_users');
const DeliveryAreas = require('../model/delivery_areas');

const Users = require('../model/users');
const UsersMeta = require('../model/users_meta');

const ProductsCategories = require('../model/products_categories');
const Products = require('../model/products');
const OptionsGroups = require('../model/options_groups');
const Options = require('../model/options');
const Items = require('../model/items');

module.exports = async (data) => {
	await Companies.bulkCreate(data.companies);
	await CompaniesMeta.bulkCreate(data.companies_meta);

	await Branches.bulkCreate(data.branches);
	await BranchesMeta.bulkCreate(data.branches_meta);
	await BranchesPaymentMethods.bulkCreate(data.branches_payment_methods);

	await Users.bulkCreate(data.users);
	await UsersMeta.bulkCreate(data.users_meta);

	await CompaniesUsers.bulkCreate(data.companies_users);
	await BranchesUsers.bulkCreate(data.branches_users);
	
	await Items.bulkCreate(data.items);
	await DeliveryAreas.bulkCreate(data.delivery_areas);

	await ProductsCategories.bulkCreate(data.products_categories);
	await Products.bulkCreate(data.products);
	await OptionsGroups.bulkCreate(data.options_groups);
	await Options.bulkCreate(data.options);
}