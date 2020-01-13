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

export default async (data) => {
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