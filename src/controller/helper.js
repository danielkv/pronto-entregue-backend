import Branch  from '../model/branch';
import BranchMeta  from '../model/branchMeta';
import BranchPaymentMethod  from '../model/branchPaymentMethod';
import BranchUser  from '../model/branchUser';
import Category  from '../model/category';
import Company  from '../model/company';
import CompanyMeta  from '../model/companyMeta';
import CompanyUser  from '../model/companyUser';
import DeliveryArea  from '../model/deliveryArea';
import Option  from '../model/option';
import OptionGroup  from '../model/optionGroup';
import Product  from '../model/product';
import User  from '../model/user';
import UserMeta  from '../model/userMeta';

export const exportDB = async (exclude) => {
	return {
		users: await User.findAll({ attributes: { exclude } }),
		userMeta: await UserMeta.findAll({ attributes: { exclude } }),

		company: await Company.findAll({ attributes: { exclude }, include: [{ model: CompanyMeta, attributes: { exclude } }] }),
		companyMeta: await CompanyMeta.findAll({ attributes: { exclude } }),
		companyUser: await CompanyUser.findAll({ attributes: { exclude } }),

		branch: await Branch.findAll({ attributes: { exclude }, include: [{ model: BranchMeta, attributes: { exclude } }] }),
		branchMeta: await BranchMeta.findAll({ attributes: { exclude } }),
		branchUser: await BranchUser.findAll({ attributes: { exclude } }),
		branchPaymentMethod: await BranchPaymentMethod.findAll({ attributes: { exclude } }),
		
		deliveryArea: await DeliveryArea.findAll({ attributes: { exclude } }),
		category: await Category.findAll({ attributes: { exclude } }),
		product: await Product.findAll({ attributes: { exclude } }),
		optionGroup: await OptionGroup.findAll({ attributes: { exclude } }),
		option: await Option.findAll({ attributes: { exclude } }),
	}
}

export const importDB = async (data) => {
	await Company.bulkCreate(data.companies);

	await Branch.bulkCreate(data.branches);
	await BranchMeta.bulkCreate(data.branch_metas);
	await BranchPaymentMethod.bulkCreate(data.branch_payment_methods);

	await User.bulkCreate(data.users);
	await UserMeta.bulkCreate(data.user_metas);

	await CompanyUser.bulkCreate(data.company_users);
	await BranchUser.bulkCreate(data.branch_users);
	
	await DeliveryArea.bulkCreate(data.delivery_areas);

	await Category.bulkCreate(data.categories);
	await Product.bulkCreate(data.products);
	await OptionGroup.bulkCreate(data.option_groups);
	await Option.bulkCreate(data.options);
}

export const importTable = async (table, data) => {
	const tables = {
		company: Company,
		companyMeta: CompanyMeta,
		companyUser: CompanyUser,
		branch: Branch,
		branchPaymentMethod: BranchPaymentMethod,
		branchMeta: BranchMeta,
		branchUser: BranchUser,
		deliveryArea: DeliveryArea,
		users: User,
		userMeta: UserMeta,
		Category: Category,
		product: Product,
		optionGroup: OptionGroup,
		option: Option,
	}

	return tables[table].bulkCreate(data);
}