import Sequelize  from 'sequelize';

import conn  from '../services/connection';

/*
 * Define modelo (tabela) de filiais
 */

class Branches extends Sequelize.Model {
	static async assignAll(branches, userInstance, transaction=null) {
		const branchesAssign = branches.filter(row=>row.id && row.action==='assign');
		const branchesUnassign = branches.filter(row=>row.id && row.action==='unassign');
		const branchesUpdate = branches.filter(row=>row.id && row.action==='update');
		
		const [assigned, unassigned, updated] = await Promise.all([
			Promise.all(branchesAssign.map(branch=>Branches.findByPk(branch.id).then(branchModel=>branchModel.addUser(userInstance, { through: { ...branch.user_relation }, transaction })))),
			Promise.all(branchesUnassign.map(branch=>Branches.findByPk(branch.id).then(branchModel=>branchModel.removeUser(userInstance, { transaction })))),
			Promise.all(branchesUpdate.map(branch=>userInstance.getBranches({ where: { id: branch.id } }).then(([branchModel])=>branchModel.branch_relation.update({ ...branch.user_relation }, { transaction })))),
		]);

		return {
			assigned,
			unassigned,
			updated
		};
	}
}
Branches.init({
	name: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, { modelName: 'branches',  sequelize: conn });

export default Branches;