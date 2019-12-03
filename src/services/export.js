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

module.exports = async (exclude) => {
	return {
		users: await Users.findAll({ attributes: { exclude } }),
		users_meta: await UsersMeta.findAll({ attributes: { exclude } }),

		companies: await Companies.findAll({ attributes: { exclude }, include: [{ model: CompaniesMeta, attributes: { exclude } }] }),
		companies_meta: await CompaniesMeta.findAll({ attributes: { exclude } }),
		companies_users: await CompaniesUsers.findAll({ attributes: { exclude } }),

		branches: await Branches.findAll({ attributes: { exclude }, include: [{ model: BranchesMeta, attributes: { exclude } }] }),
		branches_meta: await BranchesMeta.findAll({ attributes: { exclude } }),
		branches_users: await BranchesUsers.findAll({ attributes: { exclude } }),
		branches_payment_methods: await BranchesPaymentMethods.findAll({ attributes: { exclude } }),
		
		items: await Items.findAll({ attributes: { exclude } }),
		delivery_areas: await DeliveryAreas.findAll({ attributes: { exclude } }),
		products_categories: await ProductsCategories.findAll({ attributes: { exclude } }),
		products: await Products.findAll({ attributes: { exclude } }),
		options_groups: await OptionsGroups.findAll({ attributes: { exclude } }),
		options: await Options.findAll({ attributes: { exclude } }),
	}
}