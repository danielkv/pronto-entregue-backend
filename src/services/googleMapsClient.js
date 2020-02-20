import { createClient } from '@google/maps';

export default createClient({
	key: process.env.GMAPS_KEY,
	Promise: Promise
});