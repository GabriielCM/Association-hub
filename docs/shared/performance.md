---
section: shared
document: performance
status: complete
last_updated: 2026-01-10
---

# Performance

[← Voltar ao Índice](README.md)

---

## Métricas Alvo

### Dashboard

| Métrica | Alvo |
|---------|------|
| Carregamento inicial | < 3s |
| Feed (primeiros 10 posts) | < 2s |
| Stories (thumbnails) | < 1s |
| Interações (curtir, comentar) | < 500ms |

### Carteirinha

| Métrica | Alvo |
|---------|------|
| Carregamento da carteirinha | < 2s |
| Lista de benefícios | < 2s |
| Animação de flip | < 400ms |
| Busca de parceiros | < 1s |

### Eventos

| Métrica | Alvo |
|---------|------|
| Listagem de eventos | < 2s |
| Página do evento | < 1.5s |
| Scanner QR Code (reconhecimento) | < 500ms |
| Display QR Code update | < 200ms |
| Analytics em tempo real | < 3s |

---

## Otimizações

### Imagens

- Compressão antes de upload (max 5MB)
- Lazy loading em listagens
- Formatos modernos (WebP quando suportado)
- Thumbnails para previews
- CDN para distribuição

### Cache

- Cache agressivo de imagens estáticas
- Service Worker para assets
- Cache de API responses (onde apropriado)
- Funcionamento offline para dados críticos

### Listas

- Virtual scroll para listas longas (> 50 itens)
- Paginação ou infinite scroll
- Skeleton loading durante carregamento

### Tempo Real

- WebSocket com heartbeat (30s)
- Fallback para polling (30s) se WebSocket falhar
- Debounce em ações repetidas (500ms)
- Throttle em atualizações de UI

---

## Funcionamento Offline

### Carteirinha
- QR Code disponível offline
- Dados do usuário em cache
- Sincroniza ao voltar online

### Benefícios
- Lista em cache local
- Última atualização visível
- Refresh ao voltar online

### Display (Eventos)
- QR Code em cache (último válido)
- Reconexão automática
- Aviso visual "Modo Offline"

---

## Métricas a Rastrear

- [ ] Login/Logout
- [ ] Tempo de sessão
- [ ] Posts criados
- [ ] Curtidas dadas
- [ ] Comentários feitos
- [ ] Módulos mais acessados
- [ ] Pontos ganhos/gastos
- [ ] Erros de API

---

## Relacionados

- [Design System](design-system.md)
- [Responsividade](responsiveness.md)
