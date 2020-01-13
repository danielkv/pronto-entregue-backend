import PaymentMethods  from '../model/payment_methods';
import Roles  from '../model/roles';

const roles = [
	{
		name: 'branches_manager',
		display_name: 'Gerente de Filial',
		permissions: '["companies_read","branches_read","branches_edit","products_read","products_edit","options_read","options_edit","orders_read","orders_edit","delivery_areas_read","delivery_areas_edit","users_read","users_edit","payment_methods_read","payment_methods_edit","roles_read","roles_edit","customer"]'
	},
	{
		name: 'manager',
		display_name: 'Gerente',
		permissions: '["branches_read","products_read","products_edit","options_read","options_edit","orders_read","orders_edit","delivery_areas_read","delivery_areas_edit","users_read","users_edit","payment_methods_read","payment_methods_edit","roles_read","roles_edit","customer"]'
	},
	{
		name: 'seller',
		display_name: 'Vendedor',
		permissions: '["branches_read","products_read","options_read","options_edit","orders_read","orders_edit","delivery_areas_read","users_read","payment_methods_read","customer"]'
	},
	{
		name: 'customer',
		display_name: 'Cliente',
		permissions: '["customer"]'
	},
]

const payment_methods = [
	{
		name: 'CreditDebit',
		display_name: 'Cartão de Crédito/Débito',
	},
	{
		name: 'Money',
		display_name: 'Dinheiro',
	},
];

export default function () {
	return Roles.bulkCreate(roles)
		.then(()=>{
			return PaymentMethods.bulkCreate(payment_methods)
		})
}