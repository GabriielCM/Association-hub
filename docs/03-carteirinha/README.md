---
module: carteirinha
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Carteirinha

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Especificação Completa
**Prioridade:** 🔴 MVP

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Carteirinha digital frente/verso |
| [Benefícios](benefits.md) | Sistema de convênios e parceiros |
| [QR Code](qr-code.md) | Sistema de QR Code e segurança |
| [API](api.md) | Endpoints da Carteirinha |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Carteirinha digital de identificação do associado com QR Code para validação de benefícios, acesso a parceiros e informações de contato da associação. Funciona parcialmente offline.

---

## Objetivos

- Fornecer identificação digital do associado
- Facilitar validação de benefícios em estabelecimentos parceiros
- Permitir acesso e uso de convênios
- Centralizar informações de contato e instruções de uso
- Funcionar como credencial em eventos e espaços da associação

---

## Componentes Principais

1. **Carteirinha Digital (Frente/Verso)**
   - QR Code dinâmico
   - Foto, nome, matrícula
   - Instruções de uso
   - Contatos da associação

2. **Benefícios e Convênios**
   - Lista de parceiros
   - Filtros por categoria
   - Detalhes de cada parceiro

3. **Histórico de Uso**
   - Registro de usos do QR Code
   - Transferências de pontos

---

## Dependências

- [Sistema de Pontos](../06-sistema-pontos/) (transferências)
- [Perfil do Usuário](../02-perfil/) (foto, nome)
- [Notificações](../07-notificacoes/)

---

## Funcionalidade Offline

**Funciona offline:**
- ✅ Visualização da carteirinha (frente/verso)
- ✅ QR Code (gerado localmente com cache)
- ✅ Lista de benefícios (cache)
- ✅ Detalhes dos parceiros (cache)

**Requer internet:**
- ❌ Atualização de status
- ❌ Novos parceiros
- ❌ Histórico de uso
- ❌ Distância até parceiros
