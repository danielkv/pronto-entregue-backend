# Pronto, Entregue! (app)
Esse repositório faz parte de um projeto de um sistema de delivery que esteve em produção na cidade de Sombrio SC durante quase 1 ano (março/2020 - janeiro/2021). O projeto foi descontinuado por conta de uma falha no modelo de negócio e da falta de mão de obra no setor de entrega.

### Repositórios do projeto
- [App React Native](https://github.com/danielkv/pronto-entregue-app)
- [Dashboard ADM React](https://github.com/danielkv/pronto-entregue-frontend)
- [Backend ExpressJS](https://github.com/danielkv/pronto-entregue-backend)
- [Backend NestJS](https://github.com/danielkv/pronto-entregue-nest)

## Screenshots Mobile App
<a href="https://ibb.co/kKCnq2h"><img src="https://i.ibb.co/kKCnq2h/splash.png" alt="splash" border="0"></a>
<a href="https://ibb.co/kJ44vJx"><img src="https://i.ibb.co/kJ44vJx/home.png" alt="home" border="0"></a>
<a href="https://ibb.co/Msh3cd1"><img src="https://i.ibb.co/Msh3cd1/cesta.png" alt="cesta" border="0"></a>
<a href="https://ibb.co/9GcDXNG"><img src="https://i.ibb.co/9GcDXNG/pedido.png" alt="pedido" border="0"></a>
<a href="https://ibb.co/zNL6Xgg"><img src="https://i.ibb.co/zNL6Xgg/produto.png" alt="produto" border="0"></a>

## Screenshots Dashboard ADM
<a href="https://ibb.co/2h1VZ3h"><img src="https://i.ibb.co/2h1VZ3h/pedidos.jpg" alt="pedidos" border="0"></a>
<a href="https://ibb.co/yfSSp84"><img src="https://i.ibb.co/yfSSp84/pedidos1.jpg" alt="pedidos1" border="0"></a>
<a href="https://ibb.co/0GfbbnQ"><img src="https://i.ibb.co/0GfbbnQ/notificacao.jpg" alt="notificacao" border="0"></a>
<a href="https://ibb.co/VQb6qKK"><img src="https://i.ibb.co/VQb6qKK/entregas.jpg" alt="entregas" border="0"></a>
<a href="https://ibb.co/ygNZm7x"><img src="https://i.ibb.co/ygNZm7x/map.jpg" alt="map" border="0"></a>

## O sistema
Desde o início desenvolvido com a stack NodeJS, utilizado de frameworks e libs como React e React Native para o lançamento. Ao fim do projeto foi iniciado a refatoração do código BACKEND utilizando a lib NestJS. Apesar de estar praticamente finalizada, não foi colocada em produção.

A base do sistema girava em torno de localização (coordenadas). O estabelecimento apareceria para o usuário somente se estiver dentro da área de entrega configurada pelo estabelecimento.

Desde o início foi adotado o GraphQL como comunicação principal entre frontend e backend. A equipe acreditou ser o melhor caminho devido a variedade de endpoints.
No final do desenvolvimento o schema GraphQL desenvolvido com NestJS já tinha **46 queries**, **159 mutations** e 238 objetos.

Para as próximas mudanças no Dashboard o objetivo era utilizar o Framework **NextJS** para ter um melhor controle de rotas. Para o App Mobile estávamos considerando ejetar do Expo para conseguir agregar algumas libs que necessitam de acesso ao código nativo.

## Tecnologias
- **Dashboard ADM**
  - Apollo Client
  - React
- **Mobile App**
  - React Native
  - Apollo Client
  - Expo
- **Backend**
  - Apollo Server
  - ExpressJS
  - NestJS
  - Apollo Studio
- **Database MYSQL**
- GraphQL
- e outras libs auxiliares
