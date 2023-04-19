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
