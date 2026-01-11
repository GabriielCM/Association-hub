---
section: shared
document: authentication
status: partial
last_updated: 2026-01-10
---

# Autenticação & Segurança

[← Voltar ao Índice](README.md)

---

## Métodos de Login

- [ ] Email + Senha
- [ ] Social Login (Google, Apple)
- [ ] Recuperação de senha

---

## Tipos de Usuário

| Tipo | Descrição | Permissões |
|------|-----------|------------|
| Common User | Membro comum da associação | Ver conteúdo, interagir, fazer check-in |
| ADM | Administrador | Criar eventos, moderar, ver analytics |
| Display | Modo TV/Kiosk | Apenas exibir (read-only) |

Ver detalhes em [Tipos de Usuários](../00-overview/user-types.md)

---

## Tokens e Sessão

- JWT para autenticação de API
- Refresh token para renovação automática
- Sessão expira após [X dias] de inatividade

---

## Segurança

### QR Codes

**Carteirinha:**
- Nível baixo (ambiente controlado)
- Hash de segurança com HMAC-SHA256
- Validação de status do usuário

**Eventos:**
- Nível alto (anti-fraude)
- Token dinâmico (muda a cada 1 min)
- Janela de validação de 2 min
- Rate limiting por usuário

### Gerais

- HTTPS obrigatório
- Sanitização de inputs
- Proteção contra CSRF
- Rate limiting em endpoints sensíveis

---

## Relacionados

- [Tipos de Usuários](../00-overview/user-types.md)
- [Eventos - QR Code Security](../04-eventos/qr-code-security.md)
- [Carteirinha - QR Code](../03-carteirinha/qr-code.md)
