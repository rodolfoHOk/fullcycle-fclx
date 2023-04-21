# Evento: Full Cycle Learning Experience

> FullCycle / CodeEdu

## 1.o Dia - Docker e Containers e Microsserviço do ChatGPT

### Agenda

- Entender o projeto prático
- Tecnologias que serão utilizadas
- Docker
- Inicio do Microsserviço

### Projeto prático

- Duas formas / interfaces para utilizar o ChatGPT
  - Interface WEB com Autenticação
  - WhatsApp

### Dinâmica do projeto

OpenAI <- Chat (microsserviço) <-[gRPC]-- Next.js (BFF) <- Next.js (Frontend)

OpenAI <- Chat (microsserviço) <-[HTTP]-- Twilio <- WhatsApp

### OpenAI API e ChatGPT

1. Tokens

- Tokens para o ChatGPT (ou qualquer modelo baseado na arquitetura GPT) são as unidades básicas de processamento de texto usadas pelo modelo durante o treinamento e a geração de respostas.

- Os tokens podem ser palavras, caracteres, ou sub-palavras, dependendo da língua e do "tokenizador" utilizado.

2. Models

- Modelos para o ChatGPT são versões de modelos de linguagem treinados usando a arquitetura GPT (Generative Pre-trained Transformer) desenvolvida pela OpenAI.

- Eles são redes neurais profundas treinadas em grandes quantidades de texto para aprender a compreender e gerar texto humano coerente.

3. ChatGPT / API - Funcionamento básico

- Mensagem inicial do sistema (system) -> cria um contexto para a conversa
- Pergunta do usuário (user)
- Resposta do ChatGPT (assistant)
- Pergunta do usuário (user)
- Resposta do ChatGPT (assistant)

- Mensagem vão se acumulando para armazenar o contexto
- Quando não couber mais tokens, precisamos remover mensagens para a nova poder entrar

4. Tokens e Contexto

- Segredo de tudo é fazer a contagem dos tokens
- Sabendo quantos tokens estamos utilizando e a quantidade máxima do modelo, podemos acumular mensagens.
- Quanto mais mensagens, melhor a resposta por conta do contexto das anteriores

### Microsserviço de Chat

![Clean Architecture](images/clean-archtecture.png)

- Coração da aplicação deve ter suas regras de negócio consolidadas
- Coração da aplicação não sabe que existe a API da OpenAI
- Armazenar todas as conversações em um banco de dados
- Usuário poderá informar seu "user_id" como referência para ter acesso as conversas de um
  determinado usuário
- Servidor WEB e gRPC para realizar as conversas
- Precisaremos gerar um Token (credencial) no site da OpenAI para termos acesso a API
- A autenticação de nosso microsserviço também será realizada via um token fixo em um arquivo de configuração

### Tecnologias

- Docker
- Linguagem Go
- MySQL

### Docker

- Containers
- Containers vs VMs
- Como funcionam?
- Imagens
- Dockerfile
- Construindo imagens
- Image registry

### Go

- Iniciando projeto go: go mod init github.com/rodolfoHOk/fullcycle.fclx/chatservice
- Adicionando e baixando dependências: go mod tidy

## 2.o Dia - Comunicação entre microsserviços do ChatGPT na prática

### SqlC

- link: https://sqlc.dev/

- install: go install github.com/kyleconroy/sqlc/cmd/sqlc@latest

- create migrations functions: sqlc generate

### GoLang Migrate

- link: https://github.com/golang-migrate/migrate

- link CLI: https://github.com/golang-migrate/migrate/tree/master/cmd/migrate

- install CLI: go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest

- create migration: migrate create -ext=mysql -dir=sql/migrations -seq init

- migrate: migrate -path=sql/migrations -database "mysql://root:root@tcp(localhost:3306)/chat_dev" -verbose up

- migrate down: migrate -path=sql/migrations -database "mysql://root:root@tcp(localhost:3306)/chat_dev" -verbose drop

### gRPC

- link: https://grpc.io/

- link: https://protobuf.dev/overview/

- install: https://grpc.io/docs/protoc-installation/

- download: https://github.com/protocolbuffers/protobuf/releases/download/v22.3/protoc-22.3-linux-x86_64.zip

- extract: unzip protoc-22.3-linux-x86_64.zip -d ~/.local

- path env: export PATH="$PATH:$HOME/.local/bin"

- install go plugins:

  - go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
  - go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

- generate: protoc --go_out=. --go-grpc_out=. proto/chat.proto

## 3.o Dia - Backend for Frontend com Next.js

![Arquitetura do projeto](/images/project-archtecture.png)

![Arquitetura do projeto aprofundada](/images/project-archtecture2.png)

### Tecnologias

- React.js
- Next.js
- Prisma ORM
- MySQL
- Rest
- Server sent events
- gRPC
- Tailwind CSS
- Docker

### Rotas

- POST /api/chats -> Iniciar um chat
- GET /api/chats -> Listar os chats
- POST /api/chats/:ID/messages -> Publicar nova mensagem em um chat
- GET /api/chats/:ID/messages -> Listar mensagem de um chat

### Next.js

![Server side rendering](images/server-side-rendering.png)

### Prisma

- install: npm install @prisma/client

- init: npx prisma init

- create migration: npx prisma migrate dev

- update prisma types: npx prisma generate

### gRPC

![gRPC e Stream](images/grpc-stream.png)

- install: npm install @grpc/grpc-js @grpc/proto-loader

- generate types:

        proto-loader-gen-types --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir=./src/grpc/rpc ./proto/*.proto

### Server Sent Events

![Server sent events](images/server-sent-events.png)

## 4.o Dia - Frontend do ChatGPT com Next.js e React

### Tecnologias

- React.js
- Next.js
- React Server Components
- Rest
- Server sent events
- Tailwind CSS

### Check List

- Criar layout da aplicação
- Integração com o endpoints do BFF
- Criar o server side events para receber os pedaços de uma resposta
- Estilizar com Tailwind CSS

### React Server Components

![React Server Components](images/react-server-components.png)

1. Problemas do SSR padrão

- O servidor precisa regerar sempre toda a página
- Se precisar de reprocessamento da página, precisa regerá-la inteira no servidor
- Libs como formatação de datas ficam no bundle js do client
- Problemas de flexibilidade e otimização de carregamento das páginas e start do projeto

2. Benefícios do React Server Components

- Bundle javascript menor
- Carregamento inicial mais rápido
- Cache em nível de components
- Chamadas externas em paralelo (Suspense)

### Tailwind CSS

- link: https://tailwindcss.com/
- install: https://tailwindcss.com/docs/installation/using-postcss
- Utility-First Fundamentals Concepts

## 5.o Dia - KeyCloak: Integrando servidor de identidade

### Tecnologias

- Next.js
- React.js
- React Server Components
- React Client Components
- Keycloak
- NextAuth
- Docker

### Check List

- Instalar e configurar o Keycloak
- Criar um usuário no Keycloak
- Criar um client confidential no Keycloak
- Integrar o Keycloak com Next.js
- Adicionar um campo user_id no chat

### Open ID Connect

![OpenID Conect](images/openid-connect.png)

### Keycloak

1.  Criar usuário

        Acessar: http://localhost:9000
        Clicar: Administration console
        Logar: Username / Password -> Sign In
        Clicar menu: Users
        Clicar: Add user
        Preencher: Username / First name / Last name -> Create
        Clicar aba: Credentials
        Clicar: Set password
        Preencher: Password / Password confirmation / Temporary (off) -> Save
        Clicar: Save password

2.  Criar client

        Acessar: http://localhost:9000
        Clicar: Administration console
        Logar: Username / Password -> Sign In
        Clicar menu: Clients
        Clicar: Create client
        Preencher: Client type (OpenID Connect) / Client id (ex: nextjs) -> Next -> Next -> Save
        Settings aba preencher: Valid redirect URIs (http://localhost:3000/\*) / Web origin (http://localhost:3000/\*) / Client authentication (On) -> Save
        Clicar aba: Credentials
        Copiar: Client secret

### NextAuth

- link: https://next-auth.js.org/
- with Keycloak link: https://next-auth.js.org/providers/keycloak
