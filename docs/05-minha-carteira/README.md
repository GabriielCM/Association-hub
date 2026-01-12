---
module: minha-carteira
document: README
status: partial
priority: mvp
last_updated: 2026-01-11
---

# Minha Carteira

[← Voltar ao Índice](../README.md)

---

**Status:** 🟡 Em Especificação
**Prioridade:** 🔴 MVP

---

## Visão Geral

Central de gestão de pontos do usuário. Interface visual no estilo carteira/wallet que permite visualizar saldo, transferir pontos, escanear QR Codes e gerenciar a integração com Strava.

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Telas, fluxos e componentes |
| [API](api.md) | Endpoints específicos da carteira |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação e testes |

---

## Funcionalidades Principais

| Funcionalidade | Descrição |
|----------------|-----------|
| **Saldo** | Visualização do saldo em destaque (design wallet) |
| **QR Pessoal** | QR da carteirinha para receber transferências |
| **Scanner Universal** | Escanear QR para check-in, transferência ou pagamento |
| **Transferência** | Enviar pontos via QR, busca ou recentes |
| **Histórico** | Lista de transações com filtros avançados |
| **Strava** | Conexão, sincronização e gestão |

---

## Scanner Universal

O scanner detecta automaticamente o tipo de QR Code:

| Tipo de QR | Código | Ação |
|------------|--------|------|
| Check-in | `event_checkin` | Processa check-in no evento |
| Transferência | `user_transfer` | Abre fluxo de transferência |
| Pagamento PDV | `pdv_payment` | Abre confirmação de pagamento |
| Carteirinha | `member_card` | Validação (para ADM) |

---

## Telas do Módulo

1. **Home da Carteira** - Saldo, QR pessoal, ações rápidas
2. **Histórico** - Lista de transações com filtros
3. **Scanner** - Câmera para leitura de QR
4. **Transferência** - Busca destinatário e confirmação
5. **Conexão Strava** - Status, sync e configuração

---

## Fluxos Principais

### Transferir Pontos
```
Home → Transferir → Buscar/Escanear → Valor → Confirmar (biometria) → Sucesso
```

### Sincronizar Strava
```
Home → Strava → Sincronizar → Loading → Resultado (pontos ganhos)
```

### Pagar em PDV
```
Home → Scanner → Escanear QR PDV → Ver detalhes → Confirmar (biometria) → Sucesso
```

---

## Integrações

| Módulo | Relação |
|--------|---------|
| [Sistema de Pontos](../06-sistema-pontos/) | Saldo, transações, transferências |
| [Eventos](../04-eventos/) | Check-in via scanner |
| [Carteirinha](../03-carteirinha/) | QR Code para receber |
| [PDV](../16-pdv/) | Pagamento via scanner |

---

## Dependências

- **Sistema de Pontos** - Core de saldo e transações
- **Carteirinha** - QR Code de identificação
- **Eventos** - Processamento de check-in
- **PDV** - Processamento de pagamento

---

## Relacionados

- [Dashboard - Acessos Rápidos](../01-dashboard/components.md)
- [Sistema de Pontos](../06-sistema-pontos/)
- [PDV](../16-pdv/)
- [Carteirinha](../03-carteirinha/)
