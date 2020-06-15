import User from '../model/user';

class CreditsController {

	async checkUserCredits(orderData, companyInstance, options) {
		const user = await User.findByPk(orderData.userId);
		if (!user) throw new Error('Usuário não encontrado');

		const balanceModel = await user.getCreditBalance();
		if (!balanceModel) throw new('Nenhum crédito na sua conta');

		const totalOrder = orderData.price + orderData.discount;
		
		const creditBalance = balanceModel.get('value');
		if (creditBalance < totalOrder && !orderData.paymentMethodId) throw new Error('Você não tem créditos suficientes para esse pedido, selecione também um método de pagamento para completar o valor');
		
		const creditsUse = creditBalance >= totalOrder ? totalOrder : creditBalance;
		
		const createdCreditHitory = await user.createCreditHistory({ value: -creditsUse, history: `Pedido #${orderData.get('id')} em ${companyInstance.get('displayName')}` }, options)

		return createdCreditHitory;
	}
}

export default new CreditsController();