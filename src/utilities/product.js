export function calculateProcuctFinalPrice(product, campaigns) {
	if (product.price === 0) return 0;

	const price = campaigns.reduce((finalPrice, campaign) => {
		const discount = campaign.valueType === 'value' ? campaign.value : campaign.value * (finalPrice / 100);
		return finalPrice - discount;
	}, product.price).toFixed(2);

	return (price < 0) ? 0 : price;
}