const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
	keyFilename: path.join(__dirname, '../', '../', 'flakery-6c5b2b2fe628.json'),
	projectId: 'flakery',
});

module.exports = {
	storage
}