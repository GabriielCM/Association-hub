---
module: perfil
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Perfil do Usuário

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Especificação Completa
**Prioridade:** 🔴 MVP

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Componentes, fluxos, regras |
| [API](api.md) | Endpoints do Perfil |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Página de perfil do usuário exibindo informações pessoais, badges, posts e estatísticas.

---

## Objetivos

- Exibir identidade visual do usuário
- Mostrar conquistas e badges
- Permitir edição de informações pessoais
- Exibir histórico de posts

---

## Componentes Principais

1. **Header do Perfil**
   - Foto de perfil com stories
   - Nome e username
   - Badges (3 visíveis)

2. **Abas de Conteúdo**
   - Posts (grid)
   - Badges
   - Rankings

3. **Ações do Perfil**
   - Editar perfil (próprio)
   - Enviar mensagem (outro usuário)

---

## Dependências

- [Dashboard](../01-dashboard/) (navegação)
- [Sistema de Pontos](../06-sistema-pontos/) (badges)
- [Mensagens](../08-mensagens/) (DM)
