/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 * Esse arquivo roda a partir do setup.js
 */

import Branches  from './branches';
import BranchesMeta  from './branches_meta';
import BranchesPaymentMethods  from './branches_payment_methods';
import BranchesUsers  from './branches_users';
import Companies  from './companies';
import CompaniesMeta  from './companies_meta';
import CompaniesUsers  from './companies_users';
import DeliveryAreas  from './delivery_areas';
import Options  from './options';
import OptionsGroups  from './options_groups';
import Orders  from './orders';
import OrdersOptions  from './orders_options';
import OrdersOptionsGroups  from './orders_options_groups';
import OrdersProducts  from './orders_products';
import PaymentMethods  from './payment_methods';
import Products  from './products';
import ProductsCategories  from './products_categories';
import Roles  from './roles';
import Users  from './users';
import UsersMeta  from './users_meta';

//Companies Relations
Companies.hasMany(Branches, { foreignKey:'company_id' });
Companies.hasMany(CompaniesMeta, { foreignKey:'company_id' });
Companies.belongsToMany(Users, { through:CompaniesUsers, foreignKey:'company_id', otherKey:'user_id' });

//Roles relations
Roles.hasMany(BranchesUsers, { foreignKey:'role_id' });

//Branches Relations
Branches.hasMany(BranchesMeta, { foreignKey:'branch_id' });
Branches.hasMany(Orders, { foreignKey:'branch_id' });
Branches.hasMany(DeliveryAreas, { foreignKey:'branch_id' });
Branches.hasMany(ProductsCategories, { foreignKey:'branch_id' });
Branches.belongsToMany(PaymentMethods, { through:BranchesPaymentMethods, foreignKey:'branch_id', otherKey:'payment_method_id' });
Branches.belongsToMany(Users, { through:BranchesUsers, foreignKey:'branch_id', otherKey:'user_id' });
//Branches.hasMany(Products, {foreignKey:'branch_id'});

//BranchesUsers relations
BranchesUsers.belongsTo(Roles, { foreignKey:'role_id' });

//PaymentMethods
PaymentMethods.belongsToMany(Branches, { through:BranchesPaymentMethods, foreignKey:'payment_method_id', otherKey:'branch_id' });

//Users relations
Users.hasMany(UsersMeta, { foreignKey:'user_id' });
Users.hasMany(Orders, { foreignKey:'user_id' });
Users.belongsToMany(Companies, { through:CompaniesUsers, foreignKey:'user_id', otherKey:'company_id' });
Users.belongsToMany(Branches, { through:BranchesUsers, foreignKey:'user_id', otherKey:'branch_id' });

//UsersMeta
UsersMeta.belongsTo(Users, { foreignKey:'user_id' });

//ProductsCategories relations
ProductsCategories.belongsTo(Branches, { foreignKey:'branch_id' });
ProductsCategories.hasMany(Products, { foreignKey:'category_id' });

//Products relations
Products.belongsTo(ProductsCategories, { foreignKey:'category_id' });
//Products.belongsTo(Branches, {foreignKey:'company_id'});
Products.hasOne(OrdersProducts, { foreignKey:'product_id' });
Products.hasMany(OptionsGroups, { foreignKey:'product_id' });

//OptionsGroups relations
OptionsGroups.hasMany(Options, { foreignKey:'option_group_id' });
OptionsGroups.belongsTo(OptionsGroups, { foreignKey:'max_select_restrain', as:'groupRestrained' });
OptionsGroups.hasOne(OptionsGroups, { foreignKey:'max_select_restrain', as:'restrainedBy' });
OptionsGroups.belongsTo(Products, { foreignKey:'product_id' });

//Options relations
Options.belongsTo(OptionsGroups, { foreignKey:'option_group_id' });

//Orders relations
Orders.belongsTo(Users, { foreignKey:'user_id' });
Orders.belongsTo(Branches, { foreignKey:'branch_id' });
Orders.hasMany(OrdersProducts, { foreignKey:'order_id', as:'products' });
OrdersProducts.hasMany(OrdersOptionsGroups, { foreignKey:'order_product_id', as:'optionsGroups', onDelete: 'cascade' });
OrdersOptionsGroups.hasMany(OrdersOptions, { foreignKey:'order_options_group_id', as:'options', onDelete: 'cascade' });
Orders.belongsTo(PaymentMethods, { foreignKey:'payment_method_id' });

OrdersProducts.belongsTo(Products, { foreignKey:'product_id', as:'productRelated' });
OrdersOptionsGroups.belongsTo(OptionsGroups, { foreignKey:'options_group_id', as:'optionsGroupRelated' });
OrdersOptions.belongsTo(Options, { foreignKey:'option_id', as:'optionRelated' });