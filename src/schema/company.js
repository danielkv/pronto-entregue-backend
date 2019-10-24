const sequelize = require('../services/connection');
const Companies = require('../model/companies');
const CompaniesMeta = require('../model/companies_meta');
const Users = require('../model/users');
const {gql} = require('apollo-server');

module.exports.typeDefs = gql`
	type CompanyMeta {
		id:ID!
		meta_type:String!
		meta_value:String!
		createdAt:String! @dateTime
	}

	type Company {
		id:ID!
		name:String!
		display_name:String!
		active:Boolean!
		createdAt:String! @dateTime
		updatedAt:String! @dateTime
		metas:[CompanyMeta]!
		last_month_revenue:Float!
		user_relation: CompanyRelation!

		users(filter:Filter):[User]! @hasRole(permission:"users_read", scope:"adm")
		branches(filter:Filter):[Branch]! @hasRole(permission:"branches_read", scope:"adm")
		assigned_branches: [Branch]! @hasRole(permission:"users_edit", scope:"adm")
		items (filter:Filter):[Item]!
	}
	
	input CompanyMetaInput {
		id:ID
		action:String! #create | update | delete
		meta_type:String
		meta_value:String
	}

	input CompanyInput {
		name:String
		display_name:String
		active:Boolean
		metas:[CompanyMetaInput]
	}

	extend type Mutation {
		createCompany(data:CompanyInput!):Company! @hasRole(permission:"companies_edit", scope:"adm")
		updateCompany(id:ID!, data:CompanyInput!):Company! @hasRole(permission:"companies_edit", scope:"adm")
	}

	extend type Query {
		company(id:ID!): Company!
		userCompanies: [Company!] @hasRole(permission:"companies_read", scope:"adm")
	}
`;

module.exports.resolvers = {
	Mutation : {
		createCompany: (parent, {data}, ctx) => {
			return sequelize.transaction(transaction => {
				return Companies.create(data, {include:[CompaniesMeta], transaction})
			})
		},
		updateCompany: (parent, {id, data}, ctx) => {
			return sequelize.transaction(transaction => {
				return Companies.findByPk(id)
				.then(company=>{
					if (!company) throw new Error('Empresa não encontrada');

					return company.update(data, { fields: ['name', 'display_name', 'active'], transaction })
				})
				.then(async (company_updated) => {
					if (data.metas) {
						await CompaniesMeta.updateAll(data.metas, company_updated, transaction);
					}
					return company_updated;
				})
			})
		}
	},
	Query : {
		companies: (parent, args, ctx) => {
			return Companies.findAll();
		},
		userCompanies: (parent, args, ctx) => {
			if (ctx.user.can('master'))
				return Companies.findAll();

			return ctx.user.getCompanies({through:{where:{active:true}}});
		},
		company:(parent, {id}, ctx) => {
			return Companies.findByPk(id)
			.then(company => {
				if (!company) throw new Error('Empresa não encontrada');

				return company;
			});
		}
	},
	Company: {
		items : (parent, {filter}, ctx) => {
			let where = {active: true};
			if (filter && filter.showInactive) delete where.active; 
			return parent.getItems({where});
		},
		user_relation : (parent, args, ctx) => {
			if (!parent.company_relation) throw new Error('Nenhum usuário selecionado');

			return parent.company_relation.get();
		},
		assigned_branches : (parent, args, ctx) => {
			if (!parent.company_relation) throw new Error('Nenhum usuário selecionado');
			
			return parent.getUsers({where:{id:parent.company_relation.user_id}})
			.then(([user])=>{
				if (!user) throw new Error('Usuário não encontrado');

				return user.getBranches({where:{company_id:parent.get('id')}});
			})
		},
		branches: (parent, {filter}, ctx) => {
			let where = {active: true};
			if (filter && filter.showInactive) delete where.active; 

			if (!parent.company_relation) return parent.getBranches({where});
			
			return Users.findByPk(parent.company_relation.get('user_id'))
			.then(user=>{
				//se Usuário for master pode buscar todas as filiais mesmo desativadas
				if (user.get('role') === 'master') return parent.getBranches({where:{...where, company_id:parent.get('id')}});
				
				//se Usuário for adm pode buscar todas as filiais ativas
				if (user.get('role') === 'adm') return parent.getBranches({where:{...where, company_id:parent.get('id')}});

				//caso chegue aqui usuário verá a lista de filiais que estão ativas e estão vinculadas a ele
				return user.getBranches({where:{active:true, company_id:parent.get('id')}, through:{where:{active:true}}})
			});
		},
		users: (parent, {filter}, ctx) => {
			let where = {active: true};
			if (filter && filter.showInactive) delete where.active; 
			return parent.getUsers({where});
		},
		metas: (parent) => {
			return parent.getMetas();
		},
		last_month_revenue: (parent, args, ctx) => {
			return 0;
		},
	}
}