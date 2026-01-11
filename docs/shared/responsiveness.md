---
section: shared
document: responsiveness
status: complete
last_updated: 2026-01-10
---

# Responsividade

[← Voltar ao Índice](README.md)

---

## Breakpoints

| Dispositivo | Largura | Características |
|-------------|---------|-----------------|
| Mobile | 360px - 414px | Layout single column, touch-first |
| Tablet | 768px - 1024px | Grid 2 colunas, mais espaçamento |
| Desktop | > 1024px | Grid 3 colunas, max-width containers |

---

## Mobile (360px - 414px)

- Layout padrão (single column)
- Cards fullwidth
- Navegação via bottom tab bar
- Scanner: Câmera fullscreen
- Touch targets: mín 48x48px

---

## Tablet (768px - 1024px)

- Listagens: Grid 2 colunas
- Páginas de detalhe: Max-width 700px
- Display (eventos): Fullscreen
- Sidebar opcional para navegação

---

## Desktop (> 1024px)

- Listagens: Grid 3 colunas
- Páginas de detalhe: Max-width 800px centralizado
- Display (eventos): Fullscreen (1920x1080 otimizado)
- Navegação via sidebar ou top bar

---

## Display (TVs/Monitores)

- Resolução alvo: 1920x1080 (Full HD)
- Modo fullscreen (kiosk)
- Sem interação touch
- Otimizado para leitura à distância
- QR Code grande e centralizado

---

## Considerações

- Mobile-first no desenvolvimento
- Conteúdo crítico visível sem scroll
- Imagens responsivas (srcset)
- Lazy loading para performance
- Orientação: Portrait para mobile, Landscape para Display

---

## Relacionados

- [Design System](design-system.md)
- [Acessibilidade](accessibility.md)
- [Performance](performance.md)
