const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {slugify} = require('../utilities');

const destination = (folder) => {
	const company_folder = slugify(folder);

	const uploads_path = path.join(__dirname, '..', '..', 'uploads');
	if (!fs.existsSync(uploads_path)) fs.mkdirSync(uploads_path);

	const company_path = path.resolve(__dirname, '..', '..', 'uploads', company_folder);
	if (!fs.existsSync(company_path)) fs.mkdirSync(company_path);

	return path.join('uploads', company_folder);
}

const newFileName = (filename) => {
	const hash = crypto.randomBytes(16);
	const new_name = `${hash.toString("hex")}-${slugify(filename)}`;

	return new_name;
}

const createFilePath = (host, company_name, filename)=> {
	const new_destination = destination(company_name);
	const new_filename = newFileName(filename);

	const final_path = path.join(__dirname, '..', '..', new_destination, new_filename);
	const url = `${host}/${new_destination}/${new_filename}`.replace(/\\/g, '/');

	return {path:final_path, url};
}

const startUpload = async (readStream, writeStreamPath) => {
	return new Promise((resolve, reject)=>{
		const writeStream = fs.createWriteStream(writeStreamPath);

		readStream.pipe(writeStream)
		.on('finish', (err)=>{
			if (err) reject(err);

			resolve(writeStreamPath);
		});
	});
}

module.exports = {
	destination,
	newFileName,
	createFilePath,
	startUpload,
}