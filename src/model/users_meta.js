import Sequelize from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de usuários
 */

class UsersMeta extends Sequelize.Model {
	/**
	 * Atualiza, Remove e Cria todas metas
	 * 
	 */
	
	static async updateAll(metas, model_instance, transaction) {
		const metas_create = metas.filter(row=>!row.id && row.action==='create');
		const metas_update = metas.filter(row=>row.id && row.action==='update');
		const metas_remove = metas.filter(row=>row.id && row.action==='delete');
		
		const [removed, created, updated] = await Promise.all([
			UsersMeta.destroy({ where: { id: metas_remove.map(r => r.id) } , transaction }).then(() => metas_remove),
			Promise.all(metas_create.map(row => model_instance.createMeta(row, { transaction }))),
			Promise.all(metas_update.map(row => model_instance.getMetas({ where:{ id:row.id } }).then(([meta]) => {if (!meta) throw new Error('Esse metadado não pertence a esse usuário'); return meta.update(row, { fields:['meta_value'], transaction })})))
		]);

		return {
			removed,
			created,
			updated,
		};
	}
}

UsersMeta.init({
	meta_type: {
		type:Sequelize.STRING,
		comment: 'phone | email | document | address | ...',
		set(val) {
			const unique_types = ['document'];
			if (unique_types.includes(val))
				this.setDataValue('unique', true);
			
			this.setDataValue('meta_type', val);
		},
		validate : {
			async isUnique (value, done) {
				const meta = await UsersMeta.findOne({ where: { user_id: this.getDataValue('user_id'), meta_type: value } });
				const unique = this.getDataValue('unique');
				if (meta) {
					if (meta.unique === true) return done(new Error('Esse metadado já existe, você pode apenas altera-lo'));
					if (unique === true) return done(new Error('Esse metadado deve ser unico, já existem outros metadados desse tipo.'));
				}
				
				return done();
			}
		}
	},
	meta_value: Sequelize.TEXT,
	unique: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, { modelName:'users_meta', underscored:true, sequelize: conn, name:{ singular:'meta', plural:'metas' } });

export default UsersMeta;