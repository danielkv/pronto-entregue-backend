import { Storage }  from '@google-cloud/storage';
import path  from 'path';

export const storage = new Storage({
	keyFilename: path.join(__dirname, '../', '../', 'flakery-6c5b2b2fe628.json'),
	projectId: 'flakery',
});