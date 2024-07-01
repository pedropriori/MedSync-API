# MedSync Backend

Este é o repositório do backend do projeto MedSync, uma plataforma que conecta profissionais de saúde com pacientes, facilitando o acesso a serviços de saúde de qualidade, eficientes e transparentes.

## Configuração do Ambiente

Para fazer o backend funcionar corretamente, você precisará criar um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```sh
PORT=5000
MONGO_URL=sua_url_mongoDB
JWT_SECRET_KEY=sua_secret_key_JWT
STRIPE_SECRET_KEY=dev_stripe_secret_key

CLIENT_SITE_URL=http://localhost:5173

ZOOM_CLIENT_ID=seu_zoom_client_id
ZOOM_CLIENT_SECRET=seu_zoom_client_secret
ZOOM_REDIRECT_URI=http://localhost:5000/zoom/oauth/callback
ZOOM_OAUTH_URL=https://zoom.us/oauth
```

A variável `ZOOM_REDIRECT_URI` deve ser configurada também nas configurações do Zoom.

## Inicialização do Projeto

1. Clone o repositório do backend:

   ```sh
   git clone https://github.com/pedropriori/MedSync-API.git
   ```

2. Instale as dependências:

   ```sh
   cd medsync-backend
   npm install
   ```

3. Crie o arquivo `.env` e configure as variáveis de ambiente conforme mencionado anteriormente.

4. Inicie o servidor em modo de desenvolvimento:
   ```sh
   npm run start-dev
   ```

O servidor estará disponível em `http://localhost:5000`.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Stripe
- Zoom API
- BCrypt
- Entre Outros

## Contribuição

Sinta-se à vontade para fazer um fork do projeto, abrir issues e enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.
