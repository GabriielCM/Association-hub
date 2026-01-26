---
section: shared
document: accessibility
status: complete
last_updated: 2026-01-15
---

# Acessibilidade

[← Voltar ao Índice](README.md)

---

## Padrão

**WCAG 2.1 Nível AA**

---

## Diretrizes Gerais

### Contraste

- Texto normal: mínimo 4.5:1
- Texto grande (18px+ ou 14px bold): mínimo 3:1
- Componentes interativos: mínimo 3:1

### Touch Targets

- Tamanho mínimo: 48x48px
- Espaçamento entre targets: mínimo 8px
- Áreas de toque generosas em botões e links

### Navegação

- Foco visível em todos elementos interativos
- Ordem de tabulação lógica
- Skip links para conteúdo principal
- Suporte a navegação por teclado

---

## Módulo: Dashboard

- Contrast ratio mínimo 4.5:1
- Touch targets mínimo 48x48px
- Screen reader: Labels descritivos
- Skeleton loading com aria-busy
- Alt text em todas as imagens

---

## Módulo: Carteirinha

- QR Code com tamanho adequado para leitura
- Contrast ratio mínimo 4.5:1
- Touch targets mínimo 48x48px
- Animação de flip pode ser desabilitada

---

## Módulo: Eventos

### Display (TVs)

- Contrast ratio mín 4.5:1 (texto sobre imagem)
- Texto com shadow para legibilidade
- QR Code com padding branco suficiente
- Suporte a font scaling (até 200%)
- Alt text explicativo para QR Code

### Scanner

- Feedback sonoro ao escanear (opcional)
- Haptic feedback
- Mensagens de erro claras e descritivas
- Instruções visuais de posicionamento

---

## Textos Alternativos

- Todas as imagens têm alt text descritivo
- Ícones decorativos: aria-hidden="true"
- Ícones funcionais: aria-label descritivo
- QR Codes: Descrição do propósito

---

## Screen Readers

- Landmarks semânticos (header, main, nav, footer)
- Headings hierárquicos (h1 → h6)
- Listas para itens relacionados
- Tabelas com headers apropriados
- Live regions para atualizações dinâmicas

---

## Preferências do Usuário

- Respeitar prefers-reduced-motion
- Suporte a modo escuro (se implementado)
- Font scaling sem quebra de layout

---

## Testes Recomendados

- [ ] VoiceOver (iOS)
- [ ] TalkBack (Android)
- [ ] Teste de contraste
- [ ] Navegação por teclado
- [ ] Zoom até 200%

---

## Internacionalização (i18n)

- Idioma único: Português Brasileiro (PT-BR)
- Suporte a textos dinâmicos (expansão de 30-40% para futuro)
- Formatação de datas e números: locale pt-BR
- Direção de leitura: LTR
- Sem previsão de RTL ou múltiplos idiomas no MVP

---

## Relacionados

- [Design System](design-system.md)
- [Responsividade](responsiveness.md)
