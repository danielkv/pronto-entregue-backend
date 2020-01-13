var fs=require('fs');

if (process.env.GCP_KEY_FILE && process.env.GCP_CRED) {
	fs.writeFile(process.env.GCP_KEY_FILE, process.env.GCP_CRED, (err) => {
		if (err) throw err;
	});
}