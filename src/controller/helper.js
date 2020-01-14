import Branches  from '../model/branches';
import BranchesMeta  from '../model/branches_meta';
import BranchesPaymentMethods  from '../model/branches_payment_methods';
import BranchesUsers  from '../model/branches_users';
import Companies  from '../model/companies';
import CompaniesMeta  from '../model/companies_meta';
import CompaniesUsers  from '../model/companies_users';
import DeliveryAreas  from '../model/delivery_areas';
import Items  from '../model/items';
import Options  from '../model/options';
import OptionsGroups  from '../model/options_groups';
import Products  from '../model/products';
import ProductsCategories  from '../model/products_categories';
import Users  from '../model/users';
import UsersMeta  from '../model/users_meta';

export const exportDB = async (exclude) => {
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

export const importDB = async (data) => {
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

export const importTable = async (table, data) => {
	const tables = {
		companies: Companies,
		companiesMeta: CompaniesMeta,
		companiesUsers: CompaniesUsers,
		branches: Branches,
		branchesPaymentMethods: BranchesPaymentMethods,
		branchesMeta: BranchesMeta,
		branchesUsers: BranchesUsers,
		deliveryAreas: DeliveryAreas,
		users: Users,
		usersMeta: UsersMeta,
		productsCategories: ProductsCategories,
		products: Products,
		optionsGroups: OptionsGroups,
		options: Options,
	}

	return tables[table].bulkCreate(data);
}