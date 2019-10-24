const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de filiais
 */

class Branches extends Sequelize.Model {
	static async assignAll(branches, user_instance, transaction=null) {
		const branches_assign = branches.filter(row=>row.id && row.action==='assign');
		const branches_unassign = branches.filter(row=>row.id && row.action==='unassign');
		const branches_update = branches.filter(row=>row.id && row.action==='update');
		
		const [assigned, unassigned, updated] = await Promise.all([
			Promise.all(branches_assign.map(branch=>Branches.findByPk(branch.id).then(branch_model=>branch_model.addUser(user_instance, {through:{...branch.user_relation}, transaction})))),
			Promise.all(branches_unassign.map(branch=>Branches.findByPk(branch.id).then(branch_model=>branch_model.removeUser(user_instance, {transaction})))),
			Promise.all(branches_update.map(branch=>user_instance.getBranches({where:{id:branch.id}}).then(([branch_model])=>branch_model.branch_relation.update({...branch.user_relation}, {transaction})))),
		]);

		return {
			assigned,
			unassigned,
			updated
		};
	}
};
Branches.init({
	name: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, {modelName:'branches', underscored:true, sequelize});

module.exports = Branches;