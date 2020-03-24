import { Storage }  from '@google-cloud/storage';
import path  from 'path';

export const storage = new Storage({
	keyFilename: path.join(__dirname, '../', '../', process.env.GCP_KEY_FILE),
	projectId: process.env.GCP_PROJECT,
});