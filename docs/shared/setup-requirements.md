---
module: shared
document: setup-requirements
status: complete
priority: mvp
last_updated: 2026-01-31
---

# Pré-requisitos para Construção do A-hub

[← Voltar ao Índice](README.md)

---

> **Versão:** 1.0
> **Última atualização:** 31/01/2026
> **Status:** Completo

---

Este documento lista **TUDO** que você precisa instalar, configurar e fornecer para que o Claude Code construa a aplicação A-hub.

## Índice

- [1. Programas Obrigatórios](#1-programas-obrigatórios)
- [2. CLIs Específicas](#2-clis-específicas)
- [3. Contas a Criar](#3-contas-a-criar)
- [4. Chaves de API e Variáveis de Ambiente](#4-chaves-de-api-e-variáveis-de-ambiente)
- [5. Configuração do Claude Code](#5-configuração-do-claude-code)
- [6. Checklist Final](#6-checklist-final)

---

## 1. Programas Obrigatórios

Instale estes programas antes de começar:

| Programa | Versão Mínima | Comando de Verificação | Link de Download |
|----------|---------------|------------------------|------------------|
| **Node.js** | 20+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8+ | `pnpm --version` | [pnpm.io](https://pnpm.io/installation) |
| **Docker Desktop** | 24+ | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | qualquer | `git --version` | [git-scm.com](https://git-scm.com/) |
| **AWS CLI** | 2+ | `aws --version` | [aws.amazon.com/cli](https://aws.amazon.com/cli/) |
| **Terraform** | 1.5+ | `terraform --version` | [terraform.io](https://developer.hashicorp.com/terraform/downloads) |

### Instalação Rápida (Windows)

```powershell
# Usando winget (Windows Package Manager)
winget install OpenJS.NodeJS.LTS
winget install Docker.DockerDesktop
winget install Git.Git
winget install Amazon.AWSCLI
winget install Hashicorp.Terraform

# pnpm (após instalar Node.js)
npm install -g pnpm
```

### Instalação Rápida (macOS)

```bash
# Usando Homebrew
brew install node@20
brew install pnpm
brew install --cask docker
brew install git
brew install awscli
brew install terraform
```

### Verificação Completa

Execute todos os comandos para confirmar as instalações:

```bash
node --version      # Deve mostrar v20.x.x ou superior
pnpm --version      # Deve mostrar 8.x.x ou superior
docker --version    # Deve mostrar 24.x.x ou superior
git --version       # Qualquer versão
aws --version       # Deve mostrar aws-cli/2.x.x
terraform --version # Deve mostrar v1.5.x ou superior
```

---

## 2. CLIs Específicas

Após instalar Node.js e pnpm, instale estas CLIs:

### CLIs Globais (via npm)

```bash
# NestJS CLI (backend)
npm install -g @nestjs/cli

# EAS CLI (builds mobile na nuvem)
npm install -g eas-cli

# Prisma CLI (database)
npm install -g prisma

# Verificação
nest --version
eas --version
prisma --version
```

### Expo CLI (Local)

O Expo CLI **não precisa mais ser instalado globalmente**. Use via `npx` dentro do projeto:

```bash
# Dentro do projeto mobile
npx expo start
npx expo install <pacote>
npx expo prebuild
```

Ou instale localmente no projeto (o Claude Code fará isso automaticamente):

```bash
# Dentro de apps/mobile
pnpm add expo
```

### Stripe CLI

**Windows (winget):**

```powershell
winget install Stripe.StripeCLI
```

**macOS (Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Verificação:**

```bash
stripe --version
```

### Firebase CLI

```bash
  npm install -g firebase-tools
firebase --version
```

### Redis CLI

O Redis CLI vem com o Redis. Para desenvolvimento local, use Docker:

```bash
# Iniciar Redis via Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Conectar ao Redis
docker exec -it redis redis-cli
```

---

## 3. Contas a Criar

Crie contas nestas plataformas e obtenha as credenciais indicadas:

| Conta | URL | O Que Obter | Prioridade |
|-------|-----|-------------|------------|
| **GitHub** | [github.com](https://github.com/) | Repositório + SSH Key configurada | Crítico |
| **AWS** | [console.aws.amazon.com](https://console.aws.amazon.com/) | Access Key ID + Secret Access Key | Crítico |
| **Vercel** | [vercel.com](https://vercel.com/) | Conectar repositório GitHub | Crítico |
| **Expo** | [expo.dev](https://expo.dev/) | Access Token | Crítico |
| **Stripe** | [dashboard.stripe.com](https://dashboard.stripe.com/) | API Keys (modo teste) | Fase 1 |
| **Strava** | [developers.strava.com](https://developers.strava.com/) | Client ID + Client Secret | Fase 1 |
| **Firebase** | [console.firebase.google.com](https://console.firebase.google.com/) | Service Account JSON | Fase 4 |

### Detalhamento por Conta

#### GitHub

1. Criar conta em [github.com](https://github.com/)
2. Configurar SSH Key: [Documentação](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
3. Criar repositório para o projeto A-hub

#### AWS

1. Criar conta em [aws.amazon.com](https://aws.amazon.com/)
2. Acessar IAM → Users → Create User
3. Anexar política `AdministratorAccess` (para desenvolvimento)
4. Criar Access Key → Salvar `Access Key ID` e `Secret Access Key`
5. Configurar CLI:

```bash
aws configure
# AWS Access Key ID: <seu-access-key-id>
# AWS Secret Access Key: <seu-secret-access-key>
# Default region name: us-east-1
# Default output format: json
```

#### Vercel

1. Criar conta em [vercel.com](https://vercel.com/) (usar login via GitHub)
2. Importar repositório do A-hub
3. Configurar variáveis de ambiente no dashboard

#### Expo/EAS

1. Criar conta em [expo.dev](https://expo.dev/)
2. Acessar Settings → Access Tokens
3. Criar novo token → Salvar
4. Login via CLI:

```bash
eas login
```

#### Stripe (Modo Teste)

1. Criar conta em [stripe.com](https://stripe.com/)
2. Acessar Developers → API Keys
3. Copiar `Publishable key` (pk_test_...)
4. Copiar `Secret key` (sk_test_...) → **Nunca commitar!**
5. Para webhooks locais:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copiar o webhook signing secret (whsec_...)
```

#### Strava

1. Criar conta em [strava.com](https://www.strava.com/)
2. Acessar [developers.strava.com](https://developers.strava.com/)
3. Create App → Preencher dados
4. Copiar `Client ID` e `Client Secret`
5. Configurar Callback URL: `https://api.ahub.com.br/auth/strava/callback`

#### Firebase

1. Acessar [console.firebase.google.com](https://console.firebase.google.com/)
2. Criar novo projeto "ahub"
3. Habilitar Analytics e Crashlytics
4. Project Settings → Service Accounts → Generate new private key
5. Salvar o arquivo JSON (contém todas as credenciais)

---

## 4. Chaves de API e Variáveis de Ambiente

### Gerando Secrets Seguros

Use OpenSSL para gerar secrets JWT:

```bash
# JWT Secret (256 bits)
openssl rand -base64 32

# JWT Refresh Secret (256 bits)
openssl rand -base64 32
```

### Template .env (Backend - apps/api/.env)

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ahub
REDIS_URL=redis://localhost:6379

# ============================================
# AUTENTICAÇÃO
# ============================================
JWT_SECRET=<gerar-com-openssl>
JWT_REFRESH_SECRET=<gerar-com-openssl>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d

# ============================================
# AWS
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<do-console-aws>
AWS_SECRET_ACCESS_KEY=<do-console-aws>
AWS_S3_BUCKET=ahub-assets
AWS_CLOUDFRONT_DOMAIN=<seu-cloudfront-id>.cloudfront.net

# ============================================
# STRIPE (modo teste)
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# STRAVA
# ============================================
STRAVA_CLIENT_ID=<do-developers-strava>
STRAVA_CLIENT_SECRET=<do-developers-strava>
STRAVA_REDIRECT_URI=http://localhost:3000/auth/strava/callback

# ============================================
# FIREBASE
# ============================================
FIREBASE_PROJECT_ID=<do-console-firebase>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ahub.iam.gserviceaccount.com

# ============================================
# EXPO PUSH
# ============================================
EXPO_ACCESS_TOKEN=<do-expo-dev>

# ============================================
# AMBIENTE
# ============================================
NODE_ENV=development
PORT=3000
```

### Template .env (Mobile - apps/mobile/.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_STRAVA_CLIENT_ID=<client-id>
```

### Template .env (Web - apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

---

## 5. Configuração do Claude Code

### MCPs Recomendados

Configure em `.claude/settings.json`:

```json
{
  "enabledMcpServers": {
    "context7": true,
    "github": true,
    "postgres": true
  },
  "enabledPlugins": {
    "frontend-design@claude-plugins-official": true,
    "code-review@claude-plugins-official": true,
    "context7@claude-plugins-official": true
  }
}
```

| MCP | Propósito | Status |
|-----|-----------|--------|
| **Context7** | Documentação de bibliotecas em tempo real | ✅ Habilitado |
| **GitHub MCP** | PRs, issues, branches | Recomendado |
| **PostgreSQL MCP** | Queries SQL, schema inspection | Recomendado |

### Skills Disponíveis

| Skill | Comando | Descrição |
|-------|---------|-----------|
| Gap Review | `/gap-review` | Análise de consistência da documentação |

### Bibliotecas no Context7

Use estas referências para documentação:

- `/nestjs/docs` - Backend patterns
- `/prisma/docs` - ORM e migrations
- `/expo/expo` - Mobile SDK
- `/vercel/next.js` - Web framework
- `/tanstack/query` - Data fetching
- `/stripe/stripe-node` - Pagamentos
- `/socketio/socket.io` - WebSocket

---

## 6. Checklist Final

Use este checklist para validar que tudo está pronto:

### Programas Instalados

- [ ] Node.js 20+ (`node --version`)
- [ ] pnpm 8+ (`pnpm --version`)
- [ ] Docker Desktop 24+ (`docker --version`)
- [ ] Git (`git --version`)
- [ ] AWS CLI 2+ (`aws --version`)
- [ ] Terraform 1.5+ (`terraform --version`)

### CLIs Instaladas

- [ ] NestJS CLI (`nest --version`)
- [ ] EAS CLI (`eas --version`)
- [ ] Prisma CLI (`prisma --version`)
- [ ] Stripe CLI (`stripe --version`)
- [ ] Firebase CLI (`firebase --version`)
- [ ] Expo CLI - **não precisa** (usa `npx expo` no projeto)

### Contas Configuradas

- [ ] GitHub com SSH Key
- [ ] AWS com Access Keys
- [ ] Vercel conectado ao repo
- [ ] Expo com Access Token
- [ ] Stripe (modo teste) com API Keys
- [ ] Strava com Client ID/Secret
- [ ] Firebase com Service Account

### Variáveis de Ambiente

- [ ] JWT Secrets gerados
- [ ] AWS credentials configurados
- [ ] Stripe keys (test mode)
- [ ] Strava credentials
- [ ] Firebase credentials
- [ ] Expo token

### Ambiente Local

- [ ] Repositório clonado
- [ ] `pnpm install` executado
- [ ] Docker rodando (`docker ps`)
- [ ] PostgreSQL via Docker
- [ ] Redis via Docker
- [ ] Arquivos `.env` criados

### Verificação Final

```bash
# Todos devem passar sem erros
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

## Resumo de Custos

| Serviço | Custo (Desenvolvimento) | Custo (Produção) |
|---------|------------------------|------------------|
| AWS | Free Tier (12 meses) | ~$50-200/mês |
| Vercel | Gratuito (Hobby) | ~$20/mês (Pro) |
| Expo/EAS | Gratuito (builds limitados) | ~$99/mês |
| Stripe | Gratuito (modo teste) | 2.9% + $0.30 por transação |
| Strava | Gratuito | Gratuito |
| Firebase | Gratuito (Spark) | Pay as you go |

---

## Relacionados

- [Stack Tecnológica](technology-stack.md) - Detalhes de cada tecnologia
- [Configuração Claude Code](claude-code-setup.md) - MCPs, plugins e hooks
- [Roadmap](../00-overview/roadmap.md) - Fases de implementação
