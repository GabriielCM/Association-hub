# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

O A-hub é um projeto de **documentação de produto** para um aplicativo mobile de associações. Não há código-fonte - apenas especificações técnicas em Markdown organizadas em `docs/`.

## Estrutura de Documentação

```
docs/
├── README.md              # Portal principal com status de todos os módulos
├── CHANGELOG.md           # Histórico de alterações
├── 00-overview/           # Visão geral do produto
├── 01-dashboard/          # Feed social, stories, acessos rápidos (MVP - Completo)
├── 02-perfil/             # Perfil do usuário (MVP - Completo)
├── 03-carteirinha/        # Carteirinha digital, QR Code, benefícios (MVP - Completo)
├── 04-eventos/            # Eventos, check-in, display (MVP - Completo)
├── 05-minha-carteira/     # Scanner QR Code (MVP - Stub)
├── 06-sistema-pontos/     # Gamificação (MVP - Parcial)
├── 07-notificacoes/       # Notificações (MVP - Parcial)
├── 08-mensagens/          # Chat (MVP - Stub)
├── 09-15-*/               # Módulos Fase 2 e Nice to Have (Stubs)
├── shared/                # Design system, acessibilidade, performance
└── api/                   # Documentação de endpoints
```

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
Cada módulo deve conter: `README.md`, `spec.md`, `api.md`, `acceptance-criteria.md`

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
