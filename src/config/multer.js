const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const {slugify} = require('../utilities');

const destination = (req) => {
	const company_folder = slugify(req.company.name);
	const branch_folder = slugify(req.branch.name);

	const uploads_path = path.resolve(__dirname, '..', '..', 'uploads');
	if (!fs.existsSync(uploads_path)) fs.mkdirSync(uploads_path);

	const company_path = path.resolve(__dirname, '..', '..', 'uploads', company_folder);
	if (!fs.existsSync(company_path)) fs.mkdirSync(company_path);

	return company_path;
}

module.exports = {
	//dest : destination,
	storage : multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, destination(req));
		},
		filename: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if (err) cb(err);
		
				file.key = `${hash.toString("hex")}-${file.originalname}`;
		
				cb(null, file.key);
			});
		}
	}),
	limits: {
		fileSize: 2 * 1024 * 1024
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			"image/jpeg",
			"image/pjpeg",
			"image/png",
			"image/gif"
		];

		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Formato de arquivo inválido"));
		}
	}
}