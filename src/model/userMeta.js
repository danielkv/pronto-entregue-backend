import Sequelize from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de usuários
 */

class UserMeta extends Sequelize.Model {
	/**
	 * Atualiza, Remove e Cria todas metas
	 * 
	 */
	
	static async updateAll(metas, modelInstance, transaction) {
		const metasCreate = metas.filter(row=>!row.id && row.action==='create');
		const metasUpdate = metas.filter(row=>row.id && row.action==='update');
		const metasRemove = metas.filter(row=>row.id && row.action==='delete');
		
		const [removed, created, updated] = await Promise.all([
			UserMeta.destroy({ where: { id: metasRemove.map(r => r.id) } , transaction }).then(() => metasRemove),
			Promise.all(metasCreate.map(row => modelInstance.createMeta(row, { transaction }))),
			Promise.all(metasUpdate.map(row => modelInstance.getMetas({ where: { id: row.id } }).then(([meta]) => {if (!meta) throw new Error('Esse metadado não pertence a esse usuário'); return meta.update(row, { fields: ['value'], transaction })})))
		]);

		return {
			removed,
			created,
			updated,
		};
	}
}

UserMeta.init({
	key: {
		type: Sequelize.STRING,
		comment: 'phone | email | document | address | ...',
		set(val) {
			const uniqueTypes = ['document'];
			if (uniqueTypes.includes(val))
				this.setDataValue('unique', true);
			
			this.setDataValue('key', val);
		},
		validate: {
			async isUnique (value, done) {
				const meta = await UserMeta.findOne({ where: { userId: this.getDataValue('userId'), key: value } });
				const unique = this.getDataValue('unique');
				if (meta) {
					if (meta.unique === true) return done(new Error(`O metadado ${meta.key} já existe, você pode apenas altera-lo`));
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
	modelName: 'userMeta',
	tableName: 'user_metas',
	sequelize: conn,
	name: { singular: 'meta', plural: 'metas' }
});

export default UserMeta;