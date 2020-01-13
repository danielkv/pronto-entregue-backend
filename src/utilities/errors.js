class ZipcodeError extends Error {
	constructor (message) {
		super (message);
		this.name = "ZipcodeError";
		this.code = "ZIPCODE_ERROR";
	}
}

export default {
	ZipcodeError,
}