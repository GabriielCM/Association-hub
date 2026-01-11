---
module: carteirinha
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Carteirinha - Critérios de Aceitação

[← Voltar ao Índice](README.md)

---

## Carteirinha Digital

- [ ] Usuário consegue visualizar carteirinha com foto, nome, matrícula e QR Code
- [ ] Usuário consegue virar carteirinha (frente/verso) com toque ou ícone
- [ ] QR Code é exibido corretamente e escaneável
- [ ] Brilho aumenta automaticamente ao abrir carteirinha
- [ ] Carteirinha funciona offline (QR Code visível)
- [ ] Carteirinha inativa exibe estado bloqueado com motivo e link para regularizar
- [ ] Instruções de uso são claras no verso
- [ ] Informações de contato são clicáveis (ligar, email, maps, site)

---

## Benefícios e Convênios

- [ ] Usuário consegue ver lista de todos os parceiros
- [ ] Usuário consegue buscar parceiro por nome
- [ ] Usuário consegue filtrar por categoria
- [ ] Usuário consegue ordenar (A-Z, mais próximos)
- [ ] Cards de parceiros exibem logo, nome, categoria e distância
- [ ] Usuário consegue acessar detalhes de cada parceiro
- [ ] Página de detalhes exibe todas as informações (benefício, contato, horário)
- [ ] Links e telefones são clicáveis e funcionam
- [ ] Lista de benefícios funciona offline (cache)
- [ ] Badge "NOVO" aparece em parceiros adicionados há menos de 7 dias

---

## Histórico

- [ ] Usuário consegue ver histórico de uso do QR Code
- [ ] Histórico exibe data/hora e local
- [ ] Histórico é ordenado cronologicamente (mais recente primeiro)
- [ ] Estado vazio é exibido quando não há histórico

---

## Notificações

- [ ] Usuário recebe notificação ao ter carteirinha bloqueada
- [ ] Usuário recebe notificação de novos parceiros
- [ ] Usuário pode desabilitar notificações nas configurações

---

## Geral

- [ ] Todas as telas têm loading states adequados
- [ ] Estados vazios são amigáveis e informativos
- [ ] Navegação é intuitiva e fluida
- [ ] App funciona parcialmente offline conforme especificado

---

## Performance

- [ ] Carteirinha carrega em < 2s
- [ ] Lista de benefícios carrega em < 2s
- [ ] Animação de flip é suave (< 400ms)
- [ ] Cache de benefícios funciona corretamente

---

## Acessibilidade

- [ ] Contrast ratio mínimo 4.5:1
- [ ] Touch targets mínimo 48x48px
- [ ] QR Code tem tamanho adequado para leitura

---

## Relacionados

- [Especificação](spec.md)
- [Benefícios](benefits.md)
- [QR Code](qr-code.md)
- [API](api.md)
