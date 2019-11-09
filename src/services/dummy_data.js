const Companies = require('../model/companies');
const CompaniesMeta = require('../model/companies_meta');
const Users = require('../model/users');
const UsersMeta = require('../model/users_meta');
const BranchesMeta = require('../model/branches_meta');
const Options = require('../model/options');

const companies_create = [
	{
		name:"Copeiro hamburge1r",
		display_name:"Copeiro hamburguer111",
		active:true,
		metas:[
			{
				meta_type: "phone",
				meta_value: "48 99999 0000"
			},
			{
				meta_type: "document",
				meta_value:"00.000.000/0000-00"
				
			}
		]
	},
	{
		name:"Pizzaria Temperoma",
		display_name:"Pizzaria Temperoma",
		active:true,
		metas:[
			{
				meta_type: "phone",
				meta_value: "48 99999 0000"
			},
			{
				meta_type: "document",
				meta_value:"00.000.000/0000-00"
				
			}
		]
	}
]

const branches_create = [
	{
		name:"Copeiro Sombrio",
		metas:[
			{
				meta_type: "document",
				meta_value:"00.000.000/0000-00"
			}
		]
	},
	{
		name:"Copeiro Gaivota",
		metas:[
			{
				meta_type: "document",
				meta_value:"00.000.000/0000-00"
			}
		]
	},
	{
		name:"Temperoma Sombrio",
		metas:[
			{
				meta_type: "document",
				meta_value:"00.000.000/0000-00"
			}
		]
	},
]

const users_create = [
	{
		first_name:"Diego",
		last_name:"Alves",
		email:"diego@gmail.com",
		password:"123456",
		role:'adm',
		metas:[
			{
				meta_value:"000.000.000-00",
				meta_type:"document"
			}
		]
	},
	{
		first_name:"Natalia",
		last_name:"Regina",
		email:"nrolegario@gmail.com",
		password:"123456",
		active:true,
		metas:[
			{
				meta_value:"000.000.000-00",
				meta_type:"document"
			},
			{
				meta_value:"4898754686",
				meta_type:"phone"
			}
		]
	}
]

const products_create = [
	{
		name:'Hambúrguer com Calabresa',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.',
		type:'inline',
		price: 16.98,
		image : "http://localhost:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
		company_id:1,
	},
	{
		name:'Suco de laranja',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.',
		type:'inline',
		price: 4.8,
		image : "http://localhost:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
		company_id:1,
	},
	{
		name:'Pizza',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.',
		type:'panel',
		price: 55.90,
		image : "http://localhost:4000/uploads/copeiro-hamburge1r/0dfea2e56c3a2a1a331d5d56d4af528b-batata-frita-vagao-gourmet.jpg",
		company_id:1,
	},
];

const categories_create = [
	{
		name: 'Hambúrguer',
		image : "http://localhost:4000/uploads/copeiro-hamburge1r/0dfea2e56c3a2a1a331d5d56d4af528b-batata-frita-vagao-gourmet.jpg",
		branch_id : 1,
	},
	{
		name: 'Bebidas',
		image : "http://localhost:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
		branch_id : 1,
	},
	{
		name: 'Lanches',
		image : "http://localhost:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
		branch_id : 1,
	}
];

const create_options_groups = [
	{
		name:'Extras',
		min_select:0,
		max_select:3,
		type:'single',
		options:[
			{
				name:'Sem alface',
				price:0,
			},
			{
				name:'Bacon',
				price:1.5,
			},
			{
				name:'Salada',
				price:0,
			},
		]
	},
	{
		name:'Tamanho',
		min_select:1,
		max_select:1,
		type:'single',
		options:[
			{
				name:'Pequeno',
				price:0,
			},
			{
				name:'Médio',
				price:1.5,
			},
			{
				name:'Grande',
				price:0,
			},
		]
	},
	{
		name:'Sabores',
		min_select:0,
		max_select:3,
		type:'multi',
		options:[
			{
				name:'Calabres',
				price:0,
			},
			{
				name:'4 queijos',
				price:0,
			},
			{
				name:'Camarão',
				price:5,
			},
		]
	},
];

const deliveryAreas = [
	{
		name: 'Sombrio',
		type: 'single',
		price: 3,
		zipcode_a: 88960000,
	},
	{
		name: 'Gaivota',
		type: 'single',
		price: 5,
		zipcode_a: 88955000
	},
	{
		name: 'Fora de Sombrio',
		type: 'set',
		price: 10,
		zipcode_a: 88960001,
		zipcode_b: 88960010
	}
]

module.exports = function () {
	return Promise.all([
		Companies.create(companies_create[0], {include:[CompaniesMeta]}),
		Companies.create(companies_create[1], {include:[CompaniesMeta]}),
	])
	.then (async (companies)=>{
		const users = await Promise.all([
			Users.create(users_create[0], {include:[UsersMeta]}),
			Users.create(users_create[1], {include:[UsersMeta]}),
		]);

		companies[0].addUser(users[0]);
		companies[1].addUser(users[1]);

		return {companies, users};
	})
	.then(async (result)=>{
		const branches = await Promise.all([
			result.companies[0].createBranch(branches_create[0], {include:[BranchesMeta]}),
			result.companies[0].createBranch(branches_create[1], {include:[BranchesMeta]}),
			result.companies[1].createBranch(branches_create[2], {include:[BranchesMeta]}),
		]);

		//payment methods
		await branches[0].setPaymentMethods([1,2]);
		await branches[1].setPaymentMethods([2]);
		await branches[2].setPaymentMethods([1]);
		
		//delivery areas
		await branches[0].createDeliveryArea(deliveryAreas[0]);
		await branches[0].createDeliveryArea(deliveryAreas[1]);
		await branches[0].createDeliveryArea(deliveryAreas[2]);
		await branches[1].createDeliveryArea(deliveryAreas[1]);
		await branches[2].createDeliveryArea(deliveryAreas[1]);
		

		await branches[0].addUser(result.users[0], {through:{role_id:1}});
		await branches[1].addUser(result.users[0], {through:{role_id:3}});
		await branches[2].addUser(result.users[1], {through:{role_id:2}});

		return {...result, branches};
	})
	.then (async (result)=>{
		const categories = await Promise.all([
			result.branches[0].createCategory(categories_create[0]),
			result.branches[0].createCategory(categories_create[1]),
			result.branches[0].createCategory(categories_create[2]),
			result.branches[1].createCategory(categories_create[0]),
			result.branches[1].createCategory(categories_create[1]),
			result.branches[1].createCategory(categories_create[2]),
			result.branches[2].createCategory(categories_create[0]),
			result.branches[2].createCategory(categories_create[1]),
			result.branches[2].createCategory(categories_create[2]),
		]);

		const products = await Promise.all([
			categories[0].createProduct(products_create[0]),
			categories[1].createProduct(products_create[1]),
			categories[2].createProduct(products_create[2]),
			categories[3].createProduct(products_create[0]),
			categories[4].createProduct(products_create[1]),
			categories[5].createProduct(products_create[2]),
			categories[6].createProduct(products_create[0]),
			categories[7].createProduct(products_create[1]),
			categories[8].createProduct(products_create[2]),
		])
		
		return {...result, products, categories};
	})
	.then(async (result)=>{
		const options_groups = await Promise.all([
			result.products[0].createOptionsGroup(create_options_groups[0], {include:[Options]}),
			result.products[1].createOptionsGroup(create_options_groups[1], {include:[Options]}),
			result.products[2].createOptionsGroup(create_options_groups[2], {include:[Options]}),
			result.products[3].createOptionsGroup(create_options_groups[0], {include:[Options]}),
			result.products[4].createOptionsGroup(create_options_groups[1], {include:[Options]}),
			result.products[5].createOptionsGroup(create_options_groups[2], {include:[Options]}),
			result.products[6].createOptionsGroup(create_options_groups[0], {include:[Options]}),
			result.products[7].createOptionsGroup(create_options_groups[1], {include:[Options]}),
			result.products[8].createOptionsGroup(create_options_groups[2], {include:[Options]}),
		]);

		return {...result, options_groups};
	})
	.then(()=>{
		//DEVELPOMENT
		return Users.bulkCreate([
			{
				first_name: 'Daniel',
				last_name : 'Guolo',
				email: 'daniel_kv@hotmail.com',
				password: '123456',
				role: 'master'
			},
		])
	})
}