const Roles = require('../model/roles');
const PaymentMethods = require('../model/payment_methods');
const Users = require('../model/users');

Roles.bulkCreate([
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
]);

PaymentMethods.bulkCreate([
	{
		name: 'credit_debit',
		display_name: 'Cartão de Crédito/Débito',
	},
	{
		name: 'money',
		display_name: 'Dinheiro',
	},
]);


//DEVELPOMENT
if (process.env.NODE_ENV != 'production') {
	Users.bulkCreate([
		{
			first_name: 'Daniel',
			last_name : 'Guolo',
			email: 'daniel_kv@hotmail.com',
			password: '123456',
			role: 'master'
		},
	])
}