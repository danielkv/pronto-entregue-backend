// define key to be used as cache keys

export const namespace = 'model';

export const companyKey = (id)=>`company:${id}`;
export const companyRateKey = (companyId)=>`companyRate:${companyId}`;

export const loadProductKey = (id)=>`loadProduct:${id}`;
export const productKey = (id)=>`product:${id}`;
export const optionsGroupsKey = (productId)=>`productOptionsGroups:${productId}`;


export const optionsKey = (groupId)=>`groupOptions:${groupId}`;

export const categoryKey = (id)=>`category:${id}`;
export const categoryProductsKey = (categoryId)=>`productCategory:${categoryId}`;

/**'
 * references
 * - schema/options_groups.js => product()
 *  */
export const optionsGroupProductKey = (optionGroupId)=>`otionsGroupProduct:${optionGroupId}`;