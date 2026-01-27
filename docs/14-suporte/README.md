---
module: suporte
document: README
status: complete
priority: phase2
last_updated: 2026-01-26
---

# Suporte

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Completo
**Prioridade:** 🟡 Fase 2

---

## Visão Geral

Sistema de suporte para comunicação entre usuários e equipe de atendimento. Oferece múltiplos canais de contato: tickets categorizados para reportar bugs, sugestões e dúvidas; chat ao vivo 24/7 para atendimento em tempo real; e FAQ básico para autoatendimento. O sistema também captura automaticamente erros críticos do app para facilitar o diagnóstico.

---

## Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Modelo de dados, telas, fluxos, componentes |
| [API](api.md) | Endpoints REST e WebSocket |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação (216 critérios) |

---

## Funcionalidades Principais

### Para Usuários

| Funcionalidade | Descrição |
|----------------|-----------|
| Tickets | Abertura de chamados categorizados (Bug, Sugestão, Dúvida) |
| Chat ao Vivo | Atendimento em tempo real 24/7 com fila de espera |
| FAQ | Perguntas frequentes para autoatendimento básico |
| Anexos | Até 5 arquivos por mensagem (imagem, vídeo, documento, max 10MB) |
| Avaliação | Rating 1-5 estrelas + comentário após resolução |
| Erros Automáticos | Ticket criado automaticamente em crash/erro grave |

### Para Administradores

| Funcionalidade | Descrição |
|----------------|-----------|
| Lista de Tickets | Visualização com filtros por status e categoria |
| Gestão de Chat | Fila de espera e atendimentos ativos |
| CRUD de FAQ | Criar, editar, reordenar e desativar perguntas |
| Device Info | Visualização de dados técnicos em tickets automáticos |

---

## Componentes

| Componente | Descrição |
|------------|-----------|
| SupportHome | Tela principal com acesso a FAQ, Chat e Tickets |
| FAQList | Lista de perguntas frequentes em accordion |
| TicketForm | Formulário de abertura de ticket |
| TicketList | Lista de tickets do usuário com filtros |
| TicketDetail | Detalhes e histórico do ticket |
| LiveChat | Chat em tempo real com atendente |
| QueueIndicator | Indicador de posição na fila |
| RatingModal | Modal de avaliação 1-5 estrelas |
| AttachmentPicker | Seletor de anexos (câmera, galeria, arquivos) |

---

## Integrações

| Módulo | Tipo | Descrição |
|--------|------|-----------|
| [Mensagens](../08-mensagens/) | Depende | Componentes de chat reutilizados |
| [Notificações](../07-notificacoes/) | Depende | Push para atualizações de tickets e chat |
| [Perfil](../02-perfil/) | Relacionado | Link para suporte |

---

## Decisões de Negócio

| Área | Decisão |
|------|---------|
| Categorias de Ticket | Fixas: Bug, Sugestão, Dúvida |
| Categorias Customizáveis | NÃO (ADM não pode criar categorias) |
| Prioridades de Ticket | NÃO (todos tratados igualmente) |
| Integração com Pontos | NÃO |
| Limite de Anexos | 5 por mensagem |
| Tamanho de Anexo | 10MB máximo |
| Chat Disponibilidade | 24/7 com fila de espera |
| Avaliação | 1-5 estrelas + comentário opcional |
| Ticket Automático | Crash + erro grave captura device info |
| Métricas ADM | Básico (lista com filtros, sem dashboard) |

---

## Relacionados

- [Mensagens](../08-mensagens/) - Componentes de chat
- [Notificações](../07-notificacoes/) - Sistema de push
- [Perfil](../02-perfil/) - Link para suporte
