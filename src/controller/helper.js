/* eslint-disable camelcase */
import Category from '../model/category';
import Company from '../model/company';
import CompanyMeta from '../model/companyMeta';
import CompanyPaymentMethod from '../model/companyPaymentMethod';
import CompanyUser from '../model/companyUser';
import DeliveryArea from '../model/deliveryArea';
import Option from '../model/option';
import OptionsGroup from '../model/OptionsGroup';
import Order from '../model/order';
import OrderOptions from '../model/orderOptions';
import OrderOptionsGroup from '../model/orderOptionsGroup';
import OrderProduct from '../model/orderProduct';
import Product from '../model/product';
import User from '../model/user';
import UserMeta from '../model/userMeta';
import Rating from '../model/rating';


export const exportDB = async (exclude) => {
	return {
		users: await User.findAll({ attributes: { exclude } }),
		userMeta: await UserMeta.findAll({ attributes: { exclude } }),

		company: await Company.findAll({ attributes: { exclude }, include: [{ model: CompanyMeta, attributes: { exclude } }] }),
		companyMeta: await CompanyMeta.findAll({ attributes: { exclude } }),
		companyUser: await CompanyUser.findAll({ attributes: { exclude } }),
		companyPaymentMethod: await CompanyPaymentMethod.findAll({ attributes: { exclude } }),

		orders: await Order.findAll({ attributes: { exclude } }),
		order_products: OrderProduct.findAll({ attributes: { exclude } }),
		order_option_groups: OrderOptionsGroup.findAll({ attributes: { exclude } }),
		order_options: OrderOptions.findAll({ attributes: { exclude } }),
		
		deliveryArea: await DeliveryArea.findAll({ attributes: { exclude } }),
		category: await Category.findAll({ attributes: { exclude } }),
		product: await Product.findAll({ attributes: { exclude } }),
		OptionsGroup: await OptionsGroup.findAll({ attributes: { exclude } }),
		option: await Option.findAll({ attributes: { exclude } }),
	}
}

export const importDB = async (data) => {
	await Company.bulkCreate(data.companies);
	await CompanyMeta.bulkCreate(data.company_metas);

	await CompanyPaymentMethod.bulkCreate(data.company_payment_methods);

	await User.bulkCreate(data.users);
	await UserMeta.bulkCreate(data.user_metas);
	
	await Order.bulkCreate(data.orders);
	await OrderProduct.bulkCreate(data.order_products);
	await OrderOptionsGroup.bulkCreate(data.order_option_groups);
	await OrderOptions.bulkCreate(data.order_options);
	
	await Rating.bulkCreate(data.ratings);

	await CompanyUser.bulkCreate(data.company_users);
	
	await DeliveryArea.bulkCreate(data.delivery_areas);

	await Category.bulkCreate(data.categories);
	await Product.bulkCreate(data.products);
	await OptionsGroup.bulkCreate(data.option_groups);
	await Option.bulkCreate(data.options);
}

export const importTable = async (table, data) => {
	const tables = {
		company: Company,
		companyMeta: CompanyMeta,
		companyUser: CompanyUser,
		companyPaymentMethod: CompanyPaymentMethod,
		deliveryArea: DeliveryArea,
		users: User,
		userMeta: UserMeta,
		Category: Category,
		product: Product,
		OptionsGroup: OptionsGroup,
		option: Option,
	}

	return tables[table].bulkCreate(data);
}