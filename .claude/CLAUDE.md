# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

O A-hub é um projeto de **documentação de produto** para um aplicativo mobile de associações. Não há código-fonte - apenas especificações técnicas em Markdown organizadas em `docs/`.

## Estrutura de Documentação

```
docs/
├── README.md              # Portal principal com status de todos os módulos
├── CHANGELOG.md           # Histórico de alterações (versão atual: 1.5.0)
├── 00-overview/           # Visão geral do produto
├── 01-dashboard/          # Feed social, stories, acessos rápidos (MVP - Completo)
├── 02-perfil/             # Perfil do usuário (MVP - Completo)
├── 03-carteirinha/        # Carteirinha digital, QR Code, benefícios (MVP - Completo)
├── 04-eventos/            # Eventos, check-in, display (MVP - Completo)
├── 05-minha-carteira/     # Carteira de pontos, QR pessoal (MVP - Completo)
├── 06-sistema-pontos/     # Gamificação, rankings, Strava (MVP - Completo)
├── 07-notificacoes/       # Notificações (MVP - Parcial)
├── 08-mensagens/          # Chat (MVP - Completo)
├── 09-espacos/            # Espaços físicos da associação (Fase 2 - Completo)
├── 10-reservas/           # Sistema de reservas (Fase 2 - Completo)
├── 11-pedidos/            # Histórico unificado (Fase 2 - Completo)
├── 12-loja/               # E-commerce (Fase 2 - Completo)
├── 13-rankings/           # Rankings (Fase 2 - Stub)
├── 14-suporte/            # Suporte (Fase 2 - Stub)
├── 15-jukebox/            # Jukebox (Nice to Have - Stub)
├── 16-pdv/                # Ponto de Venda / Displays (MVP - Completo)
├── 17-assinaturas/        # Planos premium (Fase 2 - Completo)
├── shared/                # Design system, acessibilidade, performance
└── api/                   # Documentação centralizada de endpoints
```

### Arquivos Shared (docs/shared/)

| Arquivo | Descrição |
|---------|-----------|
| design-system.md | Cores, tipografia, componentes UI |
| authentication.md | Fluxos de autenticação |
| accessibility.md | Conformidade WCAG 2.1 AA |
| performance.md | Requisitos de performance |
| conventions.md | Convenções de documentação |
| responsiveness.md | Breakpoints e adaptações |

## Padrões Obrigatórios

### YAML Front Matter
Todos os arquivos devem iniciar com:
```yaml
---
module: nome-do-modulo
document: tipo-do-documento
status: complete | partial | stub
priority: mvp | phase2 | nice-to-have
last_updated: YYYY-MM-DD
---
```

### Estrutura de Módulo

**Arquivos obrigatórios:**
- `README.md` - Índice e visão geral
- `spec.md` - Especificação técnica completa
- `api.md` - Endpoints da API
- `acceptance-criteria.md` - Checklist de aceitação

**Arquivos opcionais (conforme necessidade):**
- `components.md` - Componentes UI específicos
- `benefits.md` - Benefícios/recursos específicos
- `qr-code.md` - Especificações de QR Code
- Outros conforme contexto do módulo

### Links Internos
Usar caminhos relativos: `[Link](../outro-modulo/doc.md)`

## Workflow de Documentação

### Antes de Criar/Editar Módulo

Fazer **20 perguntas de descoberta** organizadas em 5 categorias:

**1. Visão e Propósito (4 perguntas)**
- Qual o objetivo principal deste módulo?
- Quem são os usuários-alvo (Common User, ADM, Display)?
- Qual problema ele resolve para o usuário?
- Como ele se encaixa no fluxo geral do app?

**2. Funcionalidades Core (4 perguntas)**
- Quais são as 3-5 funcionalidades essenciais?
- Quais ações o usuário pode realizar?
- Quais informações precisam ser exibidas?
- Existem estados diferentes (loading, empty, error)?

**3. Integrações (4 perguntas)**
- Quais outros módulos ele depende?
- Quais módulos dependem dele?
- Precisa de notificações? Quais tipos?
- Integra com sistema de pontos? Como?

**4. Experiência e Interface (4 perguntas)**
- Quais são os componentes visuais principais?
- Qual o fluxo de navegação?
- Há comportamentos offline?
- Quais feedbacks visuais/táteis são necessários?

**5. Regras de Negócio e Técnico (4 perguntas)**
- Quais validações são necessárias?
- Quais são os critérios de aceitação principais?
- Há requisitos de performance específicos?
- Quais endpoints de API são necessários?

### Após Respostas

1. Preencher `spec.md` com visão geral e componentes
2. Documentar fluxos e estados
3. Listar endpoints em `api.md`
4. Criar checklist em `acceptance-criteria.md`
5. Atualizar `last_updated` em todos os arquivos modificados
6. Registrar mudanças no `CHANGELOG.md`

## Símbolos de Referência

| Símbolo | Prioridade |
|---------|------------|
| 🔴 | MVP - Essencial |
| 🟡 | Fase 2 - Importante |
| 🟢 | Nice to Have |

| Símbolo | Status |
|---------|--------|
| ⚪ | Não Iniciado |
| 🟡 | Em Especificação |
| 🔵 | Em Desenvolvimento |
| 🟢 | Concluído |
| 🔴 | Bloqueado |

## Idioma

Conteúdo em **português brasileiro**. Nomes de arquivos e pastas em **inglês**.

## Manutenção da Documentação

### Gap Review

Usar o skill `/gap-review` periodicamente para:
- Identificar inconsistências entre módulos
- Verificar links quebrados
- Validar status dos módulos
- Detectar informações desatualizadas

### Versionamento

A documentação segue versionamento semântico no CHANGELOG.md:
- **Major**: Mudanças estruturais significativas
- **Minor**: Novos módulos ou features completas
- **Patch**: Correções e ajustes menores

Versão atual: verificar `docs/CHANGELOG.md`

## Decisões de Negócio Documentadas

| Área | Decisão |
|------|---------|
| Moeda | Association-points (nome customizável por associação) |
| Pagamento Loja | Pontos, PIX ou misto (configurável por produto) |
| Pagamento PDV | APENAS pontos OU PIX (nunca misto) |
| Limite planos | Máximo 3 assinaturas ativas por usuário |
| Descontos | Não acumulam com promoções (usa o maior) |
| Cashback | Percentual global configurável por associação |
