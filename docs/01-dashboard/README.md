---
module: dashboard
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Dashboard

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Especificação Completa
**Prioridade:** 🔴 MVP
**Data:** 09/01/2026

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Visão geral, objetivos, estrutura |
| [Componentes](components.md) | Header, Pontos, Acessos, Stories, Feed |
| [API](api.md) | Endpoints do Dashboard |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Tela principal do aplicativo onde o usuário tem acesso rápido a todas as funcionalidades principais e interage com o feed social. Ponto central de navegação e engajamento da comunidade.

---

## Objetivos

- Fornecer acesso rápido e intuitivo às funcionalidades principais
- Exibir informações relevantes do usuário (saldo de pontos, notificações)
- Promover engajamento através do feed social e stories
- Facilitar descoberta de eventos e novidades da associação
- Criar senso de comunidade através de interações sociais

---

## Componentes Principais

1. **Cabeçalho / Identidade do Usuário**
   - Foto de perfil, saudação, notificações, configurações

2. **Card de Saldo de Pontos**
   - Saldo atual, variação diária, gráfico de evolução

3. **Acessos Rápidos**
   - Carrossel horizontal com módulos do app

4. **Stories de Usuários**
   - Conteúdo efêmero de 24 horas

5. **Feed de Usuários**
   - Posts com foto, enquetes, eventos

---

## Dependências

- [Sistema de Pontos](../06-sistema-pontos/)
- [Notificações](../07-notificacoes/)
- [Perfil do Usuário](../02-perfil/)
- [Eventos](../04-eventos/)

---

## Próximos Passos

1. Criar wireframes
2. Criar protótipo navegável
3. Iniciar desenvolvimento do MVP
