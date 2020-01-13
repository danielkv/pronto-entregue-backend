import data  from './dummy.json';
import importDB  from './import';

export default () => {
	return importDB(data)
}