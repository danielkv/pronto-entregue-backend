import Branch  from '../model/branch';
import BranchMeta  from '../model/branchMeta';
import BranchPaymentMethod  from '../model/branchPaymentMethod';
import BranchUser  from '../model/branchUser';
import CompanyUser  from '../model/companyUser';
import Company  from '../model/company';
import CompanyMeta  from '../model/companyMeta';
import DeliveryArea  from '../model/deliveryArea';
import Option  from '../model/option';
import OptionGroup  from '../model/optionGroup';
import Product  from '../model/product';
import Category  from '../model/category';
import Users  from '../model/user';
import UserMeta  from '../model/userMeta';

export const exportDB = async (exclude) => {
	return {
		users: await Users.findAll({ attributes: { exclude } }),
		userMeta: await UserMeta.findAll({ attributes: { exclude } }),

		company: await Company.findAll({ attributes: { exclude }, include: [{ model: CompanyMeta, attributes: { exclude } }] }),
		companyMeta: await CompanyMeta.findAll({ attributes: { exclude } }),
		companyUser: await CompanyUser.findAll({ attributes: { exclude } }),

		branch: await Branch.findAll({ attributes: { exclude }, include: [{ model: BranchMeta, attributes: { exclude } }] }),
		branchMeta: await BranchMeta.findAll({ attributes: { exclude } }),
		branchUser: await BranchUser.findAll({ attributes: { exclude } }),
		branchPaymentMethod: await BranchPaymentMethod.findAll({ attributes: { exclude } }),
		
		deliveryArea: await DeliveryArea.findAll({ attributes: { exclude } }),
		Category: await Category.findAll({ attributes: { exclude } }),
		product: await Product.findAll({ attributes: { exclude } }),
		optionGroup: await OptionGroup.findAll({ attributes: { exclude } }),
		option: await Option.findAll({ attributes: { exclude } }),
	}
}

export const importDB = async (data) => {
	await Company.bulkCreate(data.company);
	await CompanyMeta.bulkCreate(data.companyMeta);

	await Branch.bulkCreate(data.branch);
	await BranchMeta.bulkCreate(data.branchMeta);
	await BranchPaymentMethod.bulkCreate(data.branchPaymentMethod);

	await Users.bulkCreate(data.users);
	await UserMeta.bulkCreate(data.userMeta);

	await CompanyUser.bulkCreate(data.companyUser);
	await BranchUser.bulkCreate(data.branchUser);
	
	await DeliveryArea.bulkCreate(data.deliveryArea);

	await Category.bulkCreate(data.Category);
	await Product.bulkCreate(data.product);
	await OptionGroup.bulkCreate(data.optionGroup);
	await Option.bulkCreate(data.option);
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
		users: Users,
		userMeta: UserMeta,
		Category: Category,
		product: Product,
		optionGroup: OptionGroup,
		option: Option,
	}

	return tables[table].bulkCreate(data);
}