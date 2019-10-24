/*
 * Essa é a configuração todas relações e chaves 
 * estrangeiras entre todas as tabelas.
 * 
 * Esse arquivo roda a partir do setup.js
 */

const Companies = require('../model/companies');
const CompaniesMeta = require('../model/companies_meta');
const CompaniesUsers = require('../model/companies_users');
const Branches = require('../model/branches');
const BranchesPaymentMethods = require('../model/branches_payment_methods');
const BranchesMeta = require('../model/branches_meta');
const BranchesUsers = require('../model/branches_users');
const PaymentMethods = require('../model/payment_methods');
const DeliveryAreas = require('../model/delivery_areas');

const Users = require('../model/users');
const UsersMeta = require('../model/users_meta');
const Roles = require('../model/roles');

const ProductsCategories = require('../model/products_categories');
const Products = require('../model/products');
const OptionsGroups = require('../model/options_groups');
const Options = require('../model/options');
const Items = require('../model/items');

//const BranchesProducts = require('../model/branches_products');

const Orders = require('../model/orders');
const OrdersProducts = require('../model/orders_products');
const OrdersOptionsGroups = require('../model/orders_options_groups');
const OrdersOptions = require('../model/orders_options');

//Companies Relations
Companies.hasMany(Branches, {foreignKey:'company_id'});
Companies.hasMany(CompaniesMeta, {foreignKey:'company_id'});
Companies.hasMany(Items, {foreignKey:'company_id'});
Companies.belongsToMany(Users, {through:CompaniesUsers, foreignKey:'company_id', otherKey:'user_id'});

//Roles relations
Roles.hasMany(BranchesUsers, {foreignKey:'role_id'});

//Branches Relations
Branches.hasMany(BranchesMeta, {foreignKey:'branch_id'});
Branches.hasMany(Orders, {foreignKey:'branch_id'});
Branches.hasMany(DeliveryAreas, {foreignKey:'branch_id'});
Branches.hasMany(ProductsCategories, {foreignKey:'branch_id'});
Branches.belongsToMany(PaymentMethods, {through:BranchesPaymentMethods, foreignKey:'branch_id', otherKey:'payment_method_id'});
Branches.belongsToMany(Users, {through:BranchesUsers, foreignKey:'branch_id', otherKey:'user_id'});
//Branches.hasMany(Products, {foreignKey:'branch_id'});

//BranchesUsers relations
BranchesUsers.belongsTo(Roles, {foreignKey:'role_id'});

//PaymentMethods
PaymentMethods.belongsToMany(Branches, {through:BranchesPaymentMethods, foreignKey:'payment_method_id', otherKey:'branch_id'});

//Users relations
Users.hasMany(UsersMeta, {foreignKey:'user_id'});
Users.hasMany(Orders, {foreignKey:'user_id'});
Users.belongsToMany(Companies, {through:CompaniesUsers, foreignKey:'user_id', otherKey:'company_id'});
Users.belongsToMany(Branches, {through:BranchesUsers, foreignKey:'user_id', otherKey:'branch_id'});

//UsersMeta
UsersMeta.belongsTo(Users, {foreignKey:'user_id'});

//ProductsCategories relations
ProductsCategories.belongsTo(Branches, {foreignKey:'branch_id'});
ProductsCategories.hasMany(Products, {foreignKey:'category_id'});

//Products relations
Products.belongsTo(ProductsCategories, {foreignKey:'category_id'});
//Products.belongsTo(Branches, {foreignKey:'company_id'});
Products.hasOne(OrdersProducts, {foreignKey:'product_id'});
Products.hasMany(OptionsGroups, {foreignKey:'product_id'});

//OptionsGroups relations
OptionsGroups.hasMany(Options, {foreignKey:'option_group_id'});
OptionsGroups.belongsTo(OptionsGroups, {foreignKey:'max_select_restrain', as:'groupRestrained'});
OptionsGroups.hasOne(OptionsGroups, {foreignKey:'max_select_restrain', as:'restrainedBy'});
OptionsGroups.belongsTo(Products, {foreignKey:'product_id'});

//Options relations
Options.belongsTo(OptionsGroups, {foreignKey:'option_group_id'});
Options.belongsTo(Items, {foreignKey:'item_id'});

//Orders relations
Orders.belongsTo(Users, {foreignKey:'user_id'});
Orders.belongsTo(Branches, {foreignKey:'branch_id'});
Orders.hasMany(OrdersProducts, {foreignKey:'order_id', as:'products'});
OrdersProducts.hasMany(OrdersOptionsGroups, {foreignKey:'order_product_id', as:'optionsGroups', onDelete: 'cascade'});
OrdersOptionsGroups.hasMany(OrdersOptions, {foreignKey:'order_options_group_id', as:'options', onDelete: 'cascade'});
OrdersOptions.belongsTo(Items, {foreignKey:'item_id'});
Orders.belongsTo(PaymentMethods, {foreignKey:'payment_method_id'});

OrdersProducts.belongsTo(Products, {foreignKey:'product_id', as:'productRelated'});
OrdersOptionsGroups.belongsTo(OptionsGroups, {foreignKey:'options_group_id', as:'optionsGroupRelated'});
OrdersOptions.belongsTo(Options, {foreignKey:'option_id', as:'optionRelated'});

//Items relations
Items.hasMany(Options, {foreignKey:'item_id'});
Items.hasMany(OrdersOptions, {foreignKey:'item_id'});