const importDB = require('./import');
const data = require('./dummy.json');

module.exports= () => {
	return importDB(data)
}