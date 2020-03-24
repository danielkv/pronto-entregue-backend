export default {
	"users": [
		{
			"id": 1,
			"firstName": "Diego",
			"lastName": "Alves",
			"email": "diego@gmail.com",
			"password": "123456",
			"active": true,
			"role": "adm",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z"
		},
		{
			"id": 2,
			"firstName": "Natalia",
			"lastName": "Regina",
			"email": "nrolegario@gmail.com",
			"password": "123456",
			"active": true,
			"role": "customer",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z"
		},
		{
			"id": 3,
			"firstName": "Daniel",
			"lastName": "Guolo",
			"email": "daniel_kv@hotmail.com",
			"password": "123456",
			"active": true,
			"role": "master",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-12T00:47:54.000Z"
		},
		{
			"id": 4,
			"firstName": "Daniel",
			"lastName": "Guoolo",
			"email": "danielkv@hotmail.com",
			"password": "123456",
			"active": true,
			"role": "customer",
			"createdAt": "2019-12-02T19:29:05.000Z",
			"updatedAt": "2019-12-02T19:29:05.000Z"
		},
		{
			"id": 5,
			"firstName": "Pedro",
			"lastName": "Chiamenti",
			"email": "pedro@google.com",
			"password": "123456",
			"active": true,
			"role": "customer",
			"createdAt": "2019-12-10T02:43:13.000Z",
			"updatedAt": "2019-12-10T02:43:13.000Z"
		}
	],
	"user_metas": [
		{
			"id": 1,
			"key": "document",
			"value": "000.000.000-00",
			"unique": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"userId": 1
		},
		{
			"id": 3,
			"key": "document",
			"value": "000.000.000-00",
			"unique": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"userId": 2
		},
		{
			"id": 5,
			"key": "phone",
			"value": "4898754686",
			"unique": false,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"userId": 2
		},
		{
			"id": 6,
			"key": "document",
			"value": "000.000.000-00",
			"unique": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"userId": 3
		},
		{
			"id": 8,
			"key": "phone",
			"value": "4898754686",
			"unique": false,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"userId": 3
		},
		{
			"id": 12,
			"key": "phone",
			"value": "48988446680",
			"unique": false,
			"createdAt": "2019-12-02T19:29:05.000Z",
			"updatedAt": "2019-12-02T19:29:05.000Z",
			"userId": 4
		},
		{
			"id": 13,
			"key": "phone",
			"value": "489999999",
			"unique": false,
			"createdAt": "2019-12-10T02:43:14.000Z",
			"updatedAt": "2019-12-10T02:43:14.000Z",
			"userId": 5
		}
	],
	"addresses": [
		{
			"street": "Pankratz",
			"number": 8,
			"city": "Stockton",
			"state": "California",
			"zipcode": 95298,
			"district": "CA",
			"name": "Bald",
			"location": {
				"type": "Point",
				"coordinates": [-29.107948, -49.634682]
			}
		},
		{
			"street": "Scott",
			"number": 33413,
			"city": "Brooklyn",
			"state": "New York",
			"zipcode": 11241,
			"district": "NY",
			"name": "Alastair",
			"location": {
				"type": "Point",
				"coordinates": [-29.1119593,-49.6395287]
			}
		},
		{
			"street": "Claremont",
			"number": 87711,
			"city": "Dallas",
			"state": "Texas",
			"zipcode": 75251,
			"district": "TX",
			"name": "Andi",
			"location": {
				"type": "Point",
				"coordinates": [-29.111964, -49.637340]
			}
		},
		{
			"street": "Mesta",
			"number": 2,
			"city": "Richmond",
			"state": "Virginia",
			"zipcode": 23228,
			"district": "VA",
			"name": "Sabrina",
			"location": {
				"type": "Point",
				"coordinates": [-28.996789, -49.756818]
			}
		}
	],
	"companies": [
		{
			"id": 1,
			"name": "Copeiro hamburguer",
			"displayName": "Copeiro hamburguer",
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyTypeId": 1
		},
		{
			"id": 2,
			"name": "Pizzaria Temperoma",
			"displayName": "Pizzaria Temperoma",
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyTypeId": 5
		}
	],
	"company_metas": [
		{
			"id": 1,
			"key": "phone",
			"value": "48 99999 0000",
			"unique": false,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1
		},
		{
			"id": 2,
			"key": "document",
			"value": "00.000.000/0000-00",
			"unique": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1
		},
		{
			"id": 3,
			"key": "phone",
			"value": "48 99999 0000",
			"unique": false,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2
		},
		{
			"id": 4,
			"key": "document",
			"value": "00.000.000/0000-00",
			"unique": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2
		}
	],
	"company_users": [
		{
			"id": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1,
			"userId": 1,
			"roleId": 1
		},
		{
			"id": 2,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2,
			"userId": 2,
			"roleId": 1
		},
		{
			"id": 3,
			"active": true,
			"createdAt": "2019-12-02T19:29:05.000Z",
			"updatedAt": "2019-12-02T19:29:05.000Z",
			"companyId": 1,
			"userId": 4,
			"roleId": 2
		},
		{
			"id": 4,
			"active": true,
			"createdAt": "2019-12-10T02:43:14.000Z",
			"updatedAt": "2019-12-10T02:43:14.000Z",
			"companyId": 1,
			"userId": 5,
			"roleId": 2
		},
		{
			"id": 5,
			"active": true,
			"createdAt": "2019-12-12T00:46:03.000Z",
			"updatedAt": "2019-12-12T00:46:03.000Z",
			"companyId": 1,
			"userId": 3,
			"roleId": 2
		}
	],
	"company_payment_methods": [
		{
			"settings": null,
			"id": 1,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1,
			"paymentMethodId": 1
		},
		{
			"settings": null,
			"id": 3,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 3,
			"paymentMethodId": 2
		},
		{
			"settings": null,
			"id": 4,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2,
			"paymentMethodId": 1
		},
		{
			"settings": null,
			"id": 6,
			"createdAt": "2019-12-09T14:57:05.000Z",
			"updatedAt": "2019-12-09T14:57:05.000Z",
			"companyId": 1,
			"paymentMethodId": 2
		}
	],
	"delivery_areas": [
		{
			"distance": 5,
			"price": 5,
			"companyId": 1
		},
		{
			"distance": 15,
			"price": 7,
			"companyId": 1
		},
		{
			"distance": 10,
			"price": 10,
			"companyId": 2
		},
		{
			"distance": 10,
			"price": 10,
			"companyId": 2
		}
	],
	"categories": [
		{
			"id": 1,
			"name": "Hambúrguer",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/lanches-151e2150e8f64f171e5f1b2e27635d24.jpg",
			"description": "Vários sabores pra você se deliciar",
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-22T22:31:50.000Z",
			"companyId": 1
		},
		{
			"id": 2,
			"name": "Bebidas",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/bebidas-150x150-d4b634ad58b4861adecc7651d392d227.jpg",
			"description": "Sucos, refrigerantes, vinhos, etc",
			"active": true,
			"order": 2,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-22T22:31:50.000Z",
			"companyId": 2
		},
		{
			"id": 3,
			"name": "Lanches",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/porcoes-86fd77edf6f705f241034e5a4909d144.jpg",
			"description": "Porções, sanduíches",
			"active": true,
			"order": 1,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-22T22:31:50.000Z",
			"companyId": 2
		},
		{
			"id": 4,
			"name": "Hambúrguer",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/0dfea2e56c3a2a1a331d5d56d4af528b-batata-frita-vagao-gourmet.jpg",
			"description": null,
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1
		},
		{
			"id": 5,
			"name": "Bebidas",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			"description": null,
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1
		},
		{
			"id": 6,
			"name": "Lanches",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			"description": null,
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2
		},
		{
			"id": 7,
			"name": "Hambúrguer",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/0dfea2e56c3a2a1a331d5d56d4af528b-batata-frita-vagao-gourmet.jpg",
			"description": null,
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2
		},
		{
			"id": 8,
			"name": "Bebidas",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			"description": null,
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 1
		},
		{
			"id": 9,
			"name": "Lanches",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			"description": null,
			"active": true,
			"order": 0,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"companyId": 2
		}
	],
	"products": [
		{
			"price": 15,
			"id": 1,
			"active": true,
			"name": "Burguer Fit",
			"description": "Hambúrguer de frango Copeiro 180g, Tomate Seco, Rúcula e Pão de Centeio Integral",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/hamburguer-de-siri-stunt-burger-1432825855665_1280x855-2fbfc5e0b3ed02d962e3ec0bf05d1ada.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-03T00:07:01.000Z",
			"categoryId": 1,
			"companyId": 1
		},
		{
			"price": 0,
			"id": 2,
			"active": true,
			"name": "Suco de laranja",
			"description": "Suco natural de laranja",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/shutterstock_68566873-311c7352a93489a5d9ac357b29bbf77b.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T23:04:49.000Z",
			"categoryId": 2,
			"companyId": 2
		},
		{
			"price": 16.98,
			"id": 3,
			"active": true,
			"name": "Hambúrguer com Calabresa",
			"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"categoryId": 4,
			"companyId": 2
		},
		{
			"price": 0,
			"id": 4,
			"active": true,
			"name": "Pizza",
			"description": "Pizza cheia de sabor",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/01-massa-pizza-d35ccb080bf59caaaefa73b67c3f217f.png",
			
			"order": 0,
			"type": "panel",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-03T00:06:51.000Z",
			"categoryId": 3,
			"companyId": 2
		},
		{
			"price": 4.8,
			"id": 5,
			"active": true,
			"name": "Suco de laranja",
			"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"categoryId": 5,
			"companyId": 1
		},
		{
			"price": 55.9,
			"id": 6,
			"active": true,
			"name": "Pizza",
			"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/0dfea2e56c3a2a1a331d5d56d4af528b-batata-frita-vagao-gourmet.jpg",
			
			"order": 0,
			"type": "panel",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"categoryId": 6,
			"companyId": 1
		},
		{
			"price": 16.98,
			"id": 7,
			"active": true,
			"name": "Hambúrguer com Calabresa",
			"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"categoryId": 7,
			"companyId": 2
		},
		{
			"price": 4.8,
			"id": 8,
			"active": true,
			"name": "Suco de laranja",
			"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/5ac6194c6c058d82eaa26886605c121f-hamburguer-de-siri-stunt-burger-1432825855665_1280x855.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"categoryId": 8,
			"companyId": 2
		},
		{
			"price": 55.9,
			"id": 9,
			"active": true,
			"name": "Pizza",
			"description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt augue a lectus ultricies, eget euismod ex blandit. Phasellus sollicitudin tempus varius.",
			"image": "http://192.168.234.2:4000/uploads/copeiro-hamburge1r/0dfea2e56c3a2a1a331d5d56d4af528b-batata-frita-vagao-gourmet.jpg",
			
			"order": 0,
			"type": "panel",
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"categoryId": 9,
			"companyId": 1
		},
		{
			"price": 20,
			"id": 10,
			"active": true,
			"name": "Burguer Costela Gaúcha",
			"description": "2 Hambúrguer Costela 180g, Duplo Queijo Cheddar, Agrião e Pão copeiro",
			"image": "https://storage.googleapis.com/copeiro-hamburguer_flakery/shutterstock_337714676-1527287683-3245-a51ff5964f357c6def27e2a59b6eba1a.jpg",
			
			"order": 0,
			"type": "inline",
			"createdAt": "2019-12-02T22:50:18.000Z",
			"updatedAt": "2019-12-02T23:01:56.000Z",
			"categoryId": 1,
			"companyId": 2
		}
	],
	"option_groups": [
		{
			"id": 1,
			"name": "Extras",
			"type": "single",
			"order": 0,
			"minSelect": 0,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:42:18.000Z",
			"productId": 1,
			"maxSelectRestrain": null
		},
		{
			"id": 2,
			"name": "Sabores",
			"type": "multi",
			"order": 1,
			"minSelect": 1,
			"maxSelect": 3,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T20:10:03.000Z",
			"productId": 4,
			"maxSelectRestrain": null
		},
		{
			"id": 3,
			"name": "Tamanho",
			"type": "single",
			"order": 0,
			"minSelect": 1,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 2,
			"maxSelectRestrain": null
		},
		{
			"id": 4,
			"name": "Extras",
			"type": "single",
			"order": 0,
			"minSelect": 0,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 3,
			"maxSelectRestrain": null
		},
		{
			"id": 5,
			"name": "Tamanho",
			"type": "single",
			"order": 0,
			"minSelect": 1,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 5,
			"maxSelectRestrain": null
		},
		{
			"id": 6,
			"name": "Sabores",
			"type": "multi",
			"order": 0,
			"minSelect": 0,
			"maxSelect": 3,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 6,
			"maxSelectRestrain": null
		},
		{
			"id": 7,
			"name": "Extras",
			"type": "single",
			"order": 0,
			"minSelect": 0,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 7,
			"maxSelectRestrain": null
		},
		{
			"id": 8,
			"name": "Tamanho",
			"type": "single",
			"order": 0,
			"minSelect": 1,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 8,
			"maxSelectRestrain": null
		},
		{
			"id": 9,
			"name": "Sabores",
			"type": "multi",
			"order": 0,
			"minSelect": 0,
			"maxSelect": 3,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"productId": 9,
			"maxSelectRestrain": null
		},
		{
			"id": 10,
			"name": "Tamanho",
			"type": "single",
			"order": 0,
			"minSelect": 1,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-11-27T20:10:03.000Z",
			"updatedAt": "2019-11-27T20:12:49.000Z",
			"productId": 4,
			"maxSelectRestrain": 2
		},
		{
			"id": 11,
			"name": "Extras",
			"type": "single",
			"order": 0,
			"minSelect": 0,
			"maxSelect": 1,
			"active": true,
			"createdAt": "2019-12-02T22:50:18.000Z",
			"updatedAt": "2019-12-02T22:50:18.000Z",
			"productId": 10,
			"maxSelectRestrain": null
		}
	],
	"options": [
		{
			"price": 0,
			"id": 1,
			"name": "Sem alface",
			"order": 1,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:42:18.000Z",
			"optionsGroupId": 1,
			"itemId": null
		},
		{
			"price": 1.5,
			"id": 2,
			"name": "Bacon",
			"order": 2,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:42:18.000Z",
			"optionsGroupId": 1,
			"itemId": null
		},
		{
			"price": 2.5,
			"id": 3,
			"name": "Dobro de Hamburguer",
			"order": 3,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:43:03.000Z",
			"optionsGroupId": 1,
			"itemId": null
		},
		{
			"price": 0,
			"id": 4,
			"name": "Portuguesa",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 5,
			"name": "Camarão",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 0,
			"id": 6,
			"name": "Brócolis com Rúcula",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 0,
			"id": 7,
			"name": "Calabresa",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 0,
			"id": 8,
			"name": "4 queijos",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 9,
			"name": "6 Queijos",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 10,
			"name": "Fit",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 11,
			"name": "Mexicana",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 12,
			"name": "Lombo com Catupiry",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 13,
			"name": "Chocolate com Morango",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 14,
			"name": "Chocolate",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 5,
			"id": 15,
			"name": "Choquito",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 2,
			"itemId": null
		},
		{
			"price": 0,
			"id": 16,
			"name": "Sem alface",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 4,
			"itemId": null
		},
		{
			"price": 1.5,
			"id": 17,
			"name": "Bacon",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 4,
			"itemId": null
		},
		{
			"price": 0,
			"id": 18,
			"name": "Salada",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 4,
			"itemId": null
		},
		{
			"price": 0,
			"id": 19,
			"name": "Portuguesa",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 20,
			"name": "Camarão",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 0,
			"id": 21,
			"name": "Brócolis com Rúcula",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 22,
			"name": "Chocolate com Morango",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 23,
			"name": "Choquito",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 0,
			"id": 24,
			"name": "Pequeno",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 5,
			"itemId": null
		},
		{
			"price": 1.5,
			"id": 25,
			"name": "Médio",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 5,
			"itemId": null
		},
		{
			"price": 0,
			"id": 26,
			"name": "Grande",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 5,
			"itemId": null
		},
		{
			"price": 0,
			"id": 27,
			"name": "Pequeno",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 8,
			"itemId": null
		},
		{
			"price": 1.5,
			"id": 28,
			"name": "Médio",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 8,
			"itemId": null
		},
		{
			"price": 3,
			"id": 29,
			"name": "Pequeno",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:43:54.000Z",
			"optionsGroupId": 3,
			"itemId": null
		},
		{
			"price": 5,
			"id": 30,
			"name": "Médio",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:43:54.000Z",
			"optionsGroupId": 3,
			"itemId": null
		},
		{
			"price": 7,
			"id": 31,
			"name": "Grande",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-12-02T22:43:54.000Z",
			"optionsGroupId": 3,
			"itemId": null
		},
		{
			"price": 0,
			"id": 32,
			"name": "Sem alface",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 7,
			"itemId": null
		},
		{
			"price": 1.5,
			"id": 33,
			"name": "Bacon",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 7,
			"itemId": null
		},
		{
			"price": 0,
			"id": 34,
			"name": "Salada",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 7,
			"itemId": null
		},
		{
			"price": 0,
			"id": 35,
			"name": "Portuguesa",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 0,
			"id": 36,
			"name": "Calabresa",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 0,
			"id": 37,
			"name": "4 queijos",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 38,
			"name": "Fit",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 39,
			"name": "6 Queijos",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 40,
			"name": "Lombo com Catupiry",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 41,
			"name": "Chocolate",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 5,
			"id": 42,
			"name": "Mexicana",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 9,
			"itemId": null
		},
		{
			"price": 0,
			"id": 43,
			"name": "Grande",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 8,
			"itemId": null
		},
		{
			"price": 5,
			"id": 44,
			"name": "Chocolate",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 45,
			"name": "Chocolate com Morango",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 46,
			"name": "Choquito",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 47,
			"name": "Camarão",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 0,
			"id": 48,
			"name": "Brócolis com Rúcula",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 0,
			"id": 49,
			"name": "Calabresa",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 0,
			"id": 50,
			"name": "4 queijos",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 51,
			"name": "6 Queijos",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 52,
			"name": "Fit",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 53,
			"name": "Mexicana",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 5,
			"id": 54,
			"name": "Lombo com Catupiry",
			"order": 0,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-11-27T14:45:24.000Z",
			"updatedAt": "2019-11-27T14:45:24.000Z",
			"optionsGroupId": 6,
			"itemId": null
		},
		{
			"price": 30,
			"id": 55,
			"name": "Pequeno",
			"order": 0,
			"maxSelectRestrainOther": 1,
			"active": true,
			"createdAt": "2019-11-27T20:10:03.000Z",
			"updatedAt": "2019-11-27T20:10:03.000Z",
			"optionsGroupId": 10,
			"itemId": null
		},
		{
			"price": 40,
			"id": 56,
			"name": "Médio",
			"order": 1,
			"maxSelectRestrainOther": 2,
			"active": true,
			"createdAt": "2019-11-27T20:10:03.000Z",
			"updatedAt": "2019-11-27T20:10:03.000Z",
			"optionsGroupId": 10,
			"itemId": null
		},
		{
			"price": 50,
			"id": 57,
			"name": "Grande",
			"order": 2,
			"maxSelectRestrainOther": 3,
			"active": true,
			"createdAt": "2019-11-27T20:10:03.000Z",
			"updatedAt": "2019-11-27T20:10:03.000Z",
			"optionsGroupId": 10,
			"itemId": null
		},
		{
			"price": 60,
			"id": 58,
			"name": "Gigante",
			"order": 3,
			"maxSelectRestrainOther": 4,
			"active": true,
			"createdAt": "2019-11-27T20:10:03.000Z",
			"updatedAt": "2019-11-27T20:10:03.000Z",
			"optionsGroupId": 10,
			"itemId": null
		},
		{
			"price": 0,
			"id": 59,
			"name": "Sem Queijo",
			"order": 0,
			"maxSelectRestrainOther": 0,
			"active": true,
			"createdAt": "2019-12-02T22:42:18.000Z",
			"updatedAt": "2019-12-02T22:42:18.000Z",
			"optionsGroupId": 1,
			"itemId": null
		},
		{
			"price": 0,
			"id": 60,
			"name": "Sem Queijo",
			"order": 0,
			"maxSelectRestrainOther": 0,
			"active": true,
			"createdAt": "2019-12-02T22:50:18.000Z",
			"updatedAt": "2019-12-02T22:50:18.000Z",
			"optionsGroupId": 11,
			"itemId": null
		},
		{
			"price": 0,
			"id": 61,
			"name": "Sem alface",
			"order": 1,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-12-02T22:50:18.000Z",
			"updatedAt": "2019-12-02T22:50:18.000Z",
			"optionsGroupId": 11,
			"itemId": null
		},
		{
			"price": 1.5,
			"id": 62,
			"name": "Bacon",
			"order": 2,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-12-02T22:50:18.000Z",
			"updatedAt": "2019-12-02T22:50:18.000Z",
			"optionsGroupId": 11,
			"itemId": null
		},
		{
			"price": 2.5,
			"id": 63,
			"name": "Dobro de Hamburguer",
			"order": 3,
			"maxSelectRestrainOther": null,
			"active": true,
			"createdAt": "2019-12-02T22:50:18.000Z",
			"updatedAt": "2019-12-02T22:50:18.000Z",
			"optionsGroupId": 11,
			"itemId": null
		}
	],
	"orders": [
		{
			"price": 60.9,
			"discount": 0,
			"id": 1,
			"paymentFee": "0.00",
			"deliveryPrice": "0",
			"type": "takeout",
			"status": "waiting",
			"message": "",
			
			"streetAddress": "Pankratz",
			"numberAddress": 8,
			"cityAddress": "Stockton",
			"stateAddress": "California",
			"zipcodeAddress": 95298,
			"districtAddress": "CA",
			"nameAddress": "Bald",
			"locationAddress": {
				"type": "Point",
				"coordinates": [-29.107948, -49.634682]
			},
			
			"createdAt": "2020-01-26T18:29:55.000Z",
			"updatedAt": "2020-01-26T18:29:55.000Z",
			"userId": 3,
			"companyId": 1,
			"paymentMethodId": 1
		},
		{
			"price": 4.8,
			"discount": 0,
			"id": 2,
			"paymentFee": "0.00",
			"deliveryPrice": "0",
			"type": "takeout",
			"status": "waiting",
			"message": "",
			
			"streetAddress": "Pankratz",
			"numberAddress": 8,
			"cityAddress": "Stockton",
			"stateAddress": "California",
			"zipcodeAddress": 95298,
			"districtAddress": "CA",
			"nameAddress": "Bald",
			"locationAddress": {
				"type": "Point",
				"coordinates": [-29.107948, -49.634682]
			},
			
			"createdAt": "2020-01-26T18:30:11.000Z",
			"updatedAt": "2020-01-26T18:30:11.000Z",
			"userId": 1,
			"companyId": 1,
			"paymentMethodId": 2
		}
	],
	"order_products": [
		{
			"id": 1,
			"quantity": 1,
			"name": "Pizza",
			"price": "55.90",
			"message": "",
			"createdAt": "2020-01-26T18:29:55.000Z",
			"updatedAt": "2020-01-26T18:29:55.000Z",
			"productId": null,
			"orderId": 1,
			"productRelatedId": 6
		},
		{
			"id": 2,
			"quantity": 1,
			"name": "Suco de laranja",
			"price": "4.80",
			"message": "",
			"createdAt": "2020-01-26T18:30:11.000Z",
			"updatedAt": "2020-01-26T18:30:11.000Z",
			"productId": null,
			"orderId": 2,
			"productRelatedId": 5
		}
	],
	"order_option_groups": [
		{
			"id": 1,
			"name": "Sabores",
			"createdAt": "2020-01-26T18:29:55.000Z",
			"updatedAt": "2020-01-26T18:29:55.000Z",
			"orderProductId": 1,
			"optionsGroupRelatedId": 6
		},
		{
			"id": 2,
			"name": "Tamanho",
			"createdAt": "2020-01-26T18:30:11.000Z",
			"updatedAt": "2020-01-26T18:30:11.000Z",
			"orderProductId": 2,
			"optionsGroupRelatedId": 5
		}
	],
	"order_options": [
		{
			"price": 5,
			"id": 1,
			"name": "Chocolate com Morango",
			"createdAt": "2020-01-26T18:29:55.000Z",
			"updatedAt": "2020-01-26T18:29:55.000Z",
			"orderOptionsGroupId": 1,
			"optionRelatedId": 45
		},
		{
			"price": 0,
			"id": 2,
			"name": "Pequeno",
			"createdAt": "2020-01-26T18:30:11.000Z",
			"updatedAt": "2020-01-26T18:30:11.000Z",
			"orderOptionsGroupId": 2,
			"optionRelatedId": 24
		}
	],
	"ratings": [{
		"rate": 5,
		"comment": "Praesent blandit. Nam nulla. Integer pede justo, lacinia eget, tincidunt eget, tempus vel, pede.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci.",
		"companyId": 2,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Donec posuere metus vitae ipsum. Aliquam non mauris. Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet.",
		"companyId": 2,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis.",
		"companyId": 1,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Integer tincidunt ante vel ipsum.",
		"companyId": 1,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst. Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Donec posuere metus vitae ipsum. Aliquam non mauris. Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet.",
		"companyId": 2,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin risus. Praesent lectus. Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio.",
		"companyId": 2,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius.",
		"companyId": 1,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.",
		"companyId": 1,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Aenean lectus. Pellentesque eget nunc.",
		"companyId": 1,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti. Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum.",
		"companyId": 2,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "Nam nulla. Integer pede justo, lacinia eget, tincidunt eget, tempus vel, pede. Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem. Fusce consequat. Nulla nisl. Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa.",
		"companyId": 1,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "In congue. Etiam justo. Etiam pretium iaculis justo. In hac habitasse platea dictumst.",
		"companyId": 2,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Vivamus in felis eu sapien cursus vestibulum.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem. Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum.",
		"companyId": 2,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo. In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus.",
		"companyId": 2,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Etiam pretium iaculis justo. In hac habitasse platea dictumst. Etiam faucibus cursus urna.",
		"companyId": 1,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit. Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque. Duis bibendum. Morbi non quam nec dui luctus rutrum.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Nulla justo. Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus.",
		"companyId": 1,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat. Praesent blandit. Nam nulla. Integer pede justo, lacinia eget, tincidunt eget, tempus vel, pede. Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem. Fusce consequat.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Proin at turpis a pede posuere nonummy. Integer non velit. Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque. Duis bibendum. Morbi non quam nec dui luctus rutrum.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.",
		"companyId": 1,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Donec dapibus. Duis at velit eu est congue elementum. In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante.",
		"companyId": 2,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem. Integer tincidunt ante vel ipsum. Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat. Praesent blandit. Nam nulla. Integer pede justo, lacinia eget, tincidunt eget, tempus vel, pede. Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem.",
		"companyId": 1,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Nullam sit amet turpis elementum ligula vehicula consequat.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem. Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio. Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.",
		"companyId": 2,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.",
		"companyId": 1,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero. Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh. In quis justo.",
		"companyId": 1,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Pellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
		"companyId": 2,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst. Maecenas ut massa quis augue luctus tincidunt.",
		"companyId": 2,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Curabitur convallis. Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor.",
		"companyId": 1,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis. Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci.",
		"companyId": 2,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis. Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl.",
		"companyId": 1,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus.",
		"companyId": 1,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus. Curabitur at ipsum ac tellus semper interdum. Mauris ullamcorper purus sit amet nulla.",
		"companyId": 2,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit. Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue.",
		"companyId": 1,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Duis consequat dui nec nisi volutpat eleifend.",
		"companyId": 2,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Mauris lacinia sapien quis libero.",
		"companyId": 1,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "In congue.",
		"companyId": 2,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo. In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Nullam sit amet turpis elementum ligula vehicula consequat.",
		"companyId": 2,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue.",
		"companyId": 1,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus. Pellentesque at nulla.",
		"companyId": 1,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "In eleifend quam a odio. In hac habitasse platea dictumst. Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Integer non velit. Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque. Duis bibendum. Morbi non quam nec dui luctus rutrum.",
		"companyId": 1,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Aenean fermentum. Donec ut mauris eget massa tempor convallis.",
		"companyId": 2,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo. Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc.",
		"companyId": 1,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla.",
		"companyId": 2,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis. Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis.",
		"companyId": 1,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Aenean sit amet justo. Morbi ut odio. Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem. Praesent id massa id nisl venenatis lacinia.",
		"companyId": 1,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est.",
		"companyId": 2,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi. Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit.",
		"companyId": 2,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis. Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.",
		"companyId": 2,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst. Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.",
		"companyId": 2,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus. Curabitur at ipsum ac tellus semper interdum. Mauris ullamcorper purus sit amet nulla. Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
		"companyId": 2,
		"userId": 5,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
		"companyId": 1,
		"userId": 4,
		"orderId": 2
	}, {
		"rate": 5,
		"comment": "Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti. Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Nulla mollis molestie lorem. Quisque ut erat.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Nunc purus. Phasellus in felis.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.",
		"companyId": 2,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 2,
		"comment": "Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci.",
		"companyId": 1,
		"userId": 4,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "Donec posuere metus vitae ipsum. Aliquam non mauris. Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.",
		"companyId": 2,
		"userId": 3,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Suspendisse accumsan tortor quis turpis. Sed ante.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.",
		"companyId": 1,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus. Pellentesque at nulla. Suspendisse potenti.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla.",
		"companyId": 2,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Sed accumsan felis.",
		"companyId": 1,
		"userId": 3,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus. Pellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
		"companyId": 1,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 5,
		"comment": "Etiam pretium iaculis justo. In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius.",
		"companyId": 1,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 4,
		"comment": "Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue.",
		"companyId": 2,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Maecenas pulvinar lobortis est. Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.",
		"companyId": 1,
		"userId": 2,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo.",
		"companyId": 2,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio.",
		"companyId": 2,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Nullam molestie nibh in lectus. Pellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
		"companyId": 2,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 3,
		"comment": "Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris. Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis. Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis.",
		"companyId": 2,
		"userId": 1,
		"orderId": 1
	}, {
		"rate": 1,
		"comment": "Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis. Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci.",
		"companyId": 1,
		"userId": 1,
		"orderId": 2
	}, {
		"rate": 2,
		"comment": "Donec ut dolor.",
		"companyId": 1,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 4,
		"comment": "Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue.",
		"companyId": 1,
		"userId": 5,
		"orderId": 1
	}, {
		"rate": 3,
		"comment": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo.",
		"companyId": 1,
		"userId": 2,
		"orderId": 2
	}, {
		"rate": 1,
		"comment": "Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
		"companyId": 1,
		"userId": 3,
		"orderId": 2
	}]
}