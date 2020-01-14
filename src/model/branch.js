import Sequelize  from 'sequelize';

import conn  from '../services/connection';

/*
 * Define modelo (tabela) de filiais
 */

class Branch extends Sequelize.Model {
	static async assignAll(branches, userInstance, transaction=null) {
		const branchesAssign = branches.filter(row=>row.id && row.action==='assign');
		const branchesUnassign = branches.filter(row=>row.id && row.action==='unassign');
		const branchesUpdate = branches.filter(row=>row.id && row.action==='update');
		
		const [assigned, unassigned, updated] = await Promise.all([
			Promise.all(branchesAssign.map(branch=>Branch.findByPk(branch.id).then(branchModel=>branchModel.addUser(userInstance, { through: { ...branch.userRelation }, transaction })))),
			Promise.all(branchesUnassign.map(branch=>Branch.findByPk(branch.id).then(branchModel=>branchModel.removeUser(userInstance, { transaction })))),
			Promise.all(branchesUpdate.map(branch=>userInstance.getBranches({ where: { id: branch.id } }).then(([branchModel])=>branchModel.branchRelation.update({ ...branch.userRelation }, { transaction })))),
		]);

		return {
			assigned,
			unassigned,
			updated
		};
	}
}
Branch.init({
	name: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, {
	tableName: 'branch',
	sequelize: conn
});

export default Branch;