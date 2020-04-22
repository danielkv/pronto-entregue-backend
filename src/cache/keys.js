export const namespace = 'model';

export const companyKey = (id)=>`${namespace}:company:${id}`;
export const companyRateKey = (companyId)=>`${namespace}:companyRate:${companyId}`;

export const productKey = (id)=>`${namespace}:product:${id}`;
export const optionsGroupsKey = (productId)=>`${namespace}:productOptionsGroups:${productId}`;

export const optionsKey = (groupId)=>`${namespace}:groupOptions:${groupId}`;

export const categoryKey = (id)=>`${namespace}:category:${id}`;
export const categoryProductsKey = (categoryId)=>`${namespace}:productCategory:${categoryId}`;