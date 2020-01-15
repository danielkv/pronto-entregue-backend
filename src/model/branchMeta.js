import Sequelize  from 'sequelize';

import conn  from '../services/connection';


/*
 * Define modelo (tabela) de metadata para as filiais
 */

class BranchMeta extends Sequelize.Model {
	static async updateAll(metas, modelInstance, transaction=null) {
		const metasCreate = metas.filter(row=>!row.id && row.action==='create');
		const metasUpdate = metas.filter(row=>row.id && row.action==='update');
		const metasRemove = metas.filter(row=>row.id && row.action==='delete');
		
		const [removed, created, updated] = await Promise.all([
			BranchMeta.destroy({ where: { id: metasRemove.map(r => r.id) }, transaction }).then(() => metasRemove),
			Promise.all(metasCreate.map(row => modelInstance.createMeta(row, { transaction }))),
			Promise.all(metasUpdate.map(row => modelInstance.getMetas({ where: { id: row.id } }).then(([meta]) => {if (!meta) throw new Error('Esse metadado não pertence a essa filial'); return meta.update(row, { fields: ['value'], transaction })})))
		]);

		return {
			removed,
			created,
			updated,
		};
	}
}
BranchMeta.init({
	key: {
		type: Sequelize.STRING,
		comment: 'phone | email | document | businessHours | address | ...',
		set(val) {
			const uniqueTypes = ['document', 'businessHours'];
			if (uniqueTypes.includes(val))
				this.setDataValue('unique', true);
			
			this.setDataValue('key', val);
		},
		validate: {
			async isUnique (value, done) {
				const meta = await BranchMeta.findOne({ where: { branchId: this.getDataValue('branchId'), key: value } });
				const unique = this.getDataValue('unique');
				if (meta) {
					if (meta.unique === true) return done(new Error('Esse metadado já existe, você pode apenas altera-lo'));
					if (unique === true) return done(new Error('Esse metadado deve ser unico, já existem outros metadados desse tipo.'));
				}
				
				return done();
			}
		}
	},
	value: Sequelize.TEXT,
	unique: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, {
	tableName: 'branch_metas',
	sequelize: conn,
	name: { singular: 'meta', plural: 'metas' }
});

export default BranchMeta;