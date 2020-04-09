import crypto  from 'crypto';
import { extname, basename }  from 'path';

import { storage }  from '../services/gcloud';
import { slugify }  from '../utilities';

export const upload = async (bucketName, file) => {
	const bucket = await getFileBucket(bucketName);
	const { url } = await startUpload(bucket, file);

	return url;
}

const getFileBucket = async (bucketName) => {
	const slugifiedName = `${slugify(bucketName)}_flakery`;
	const bucket = storage.bucket(slugifiedName);

	return bucket.exists()
		.then(async ([exists])=>{
			if (exists) return bucket;

			const [createdBucket] = await storage.createBucket(slugifiedName);
			return createdBucket;
		})
}

const newFileName = (fileName, bytes=16) => {
	const fileExtension = extname(fileName);
	const baseName = basename(fileName, fileExtension);
	const hash = crypto.randomBytes(bytes);
	const newName = `${slugify(baseName)}-${hash.toString("hex")}${fileExtension}`;

	return newName;
}

const startUpload = async (bucket, file) => {
	return new Promise((resolve, reject)=>{
		const { filename, createReadStream, mimetype } = file;

		const newFile = bucket.file(newFileName(filename));
		const writeStream = newFile.createWriteStream({
			resumable: false,
			public: true,
			gzip: true,
			metadata: {
				contentType: mimetype
			}
		})

		createReadStream()
			
			.pipe(writeStream)
			.on('error', reject)
			.on('finish', ()=>{
				const url = `https://${newFile.storage.apiEndpoint}/${newFile.bucket.name}/${newFile.name}`;
				
				resolve({ file: newFile, url });
			});
	});
}