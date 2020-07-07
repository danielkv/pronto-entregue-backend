export default function reduceTokensMetas(metas) {
	return metas.reduce((tokens, meta)=>{
		const value = meta.value;
		if (!value) return tokens;

		return [...tokens, ...JSON.parse(value)]
	}, [])
}