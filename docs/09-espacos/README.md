---
module: espacos
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Espaços

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Completo
**Prioridade:** 🟡 Fase 2

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Detalhamento técnico completo |
| [API](api.md) | Endpoints REST |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Módulo de cadastro e gestão de espaços físicos da associação (churrasqueiras, salões de festa, quadras, piscinas, etc.). O ADM configura cada espaço com suas regras específicas de reserva, e os espaços ficam disponíveis para reserva pelos funcionários através do [módulo de Reservas](../10-reservas/).

---

## Objetivos

- Cadastrar espaços com informações detalhadas (nome, descrição, fotos, capacidade)
- Permitir configuração flexível por espaço (período, antecedência, intervalo entre locações)
- Definir bloqueio de espaços relacionados (quando um espaço é reservado, outros ficam indisponíveis)
- Gerenciar estados de disponibilidade (manutenção, bloqueio de datas)
- Integrar com módulo de Eventos (seleção de local)
- Integrar com módulo de Reservas (disponibilidade)

---

## Tipos de Usuários

### Common User (Funcionário)
- ✅ Visualizar lista de espaços
- ✅ Ver detalhes do espaço (fotos, capacidade, regras)
- ✅ Ver disponibilidade no calendário
- ❌ Criar/editar/deletar espaços

### Gerente
- ✅ Tudo que Funcionário pode
- ✅ Marcar espaço em manutenção
- ✅ Bloquear datas específicas
- ❌ Criar/editar/deletar espaços

### ADM (Administrador)
- ✅ Tudo que Gerente pode
- ✅ Criar novos espaços
- ✅ Editar espaços existentes
- ✅ Deletar espaços (soft delete)
- ✅ Configurar regras de reserva
- ✅ Definir bloqueio de espaços relacionados

---

## Campos do Espaço

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome | Texto | Sim | Nome do espaço |
| Descrição | Texto longo | Sim | Descrição detalhada |
| Galeria de fotos | Imagens | Sim (mín. 1) | Múltiplas imagens do espaço |
| Capacidade | Número | Sim | Número máximo de pessoas |
| Taxa | Valor monetário | Não | Custo da reserva (se aplicável) |
| Período de reserva | Enum | Sim | Dia inteiro, Turno ou Hora |
| Antecedência mínima | Número (dias) | Sim | Mínimo de dias para reservar |
| Antecedência máxima | Número (dias) | Sim | Máximo de dias para reservar |
| Intervalo entre locações | Número (meses) | Não | Tempo mínimo entre reservas do mesmo usuário |
| Espaços bloqueados | Lista | Não | Espaços que ficam indisponíveis quando este for reservado |
| Status | Enum | Sim | Ativo, Manutenção, Inativo |

---

## Estados do Espaço

| Estado | Descrição | Quem pode alterar |
|--------|-----------|-------------------|
| Ativo | Disponível para reservas | ADM |
| Manutenção | Temporariamente indisponível | Gerente, ADM |
| Inativo | Desativado permanentemente | ADM |

---

## Componentes Principais

- **Lista de Espaços** - Grid/lista com cards dos espaços
- **Card de Espaço** - Foto principal, nome, capacidade, status
- **Página de Detalhes** - Galeria, descrição completa, regras
- **Formulário de Cadastro** - Criação/edição de espaço (ADM)
- **Configurações do Espaço** - Regras de reserva
- **Calendário de Disponibilidade** - Visualização de datas

---

## Integrações

### Eventos
- Dropdown com espaços pré-cadastrados na criação de evento
- Auto-preenche: capacidade, fotos
- Link clicável para ver detalhes do espaço

### Reservas
- Fornece lista de espaços disponíveis
- Aplica regras de reserva configuradas
- Atualiza disponibilidade em tempo real

### Feed Social
- Não aparece diretamente no feed
- Apenas via módulo de Reservas (mostra "espaço ocupado")

---

## Dependências

- [Reservas](../10-reservas/) - Sistema de reservas
- [Eventos](../04-eventos/) - Seleção de local

---

## Relacionados

- [Especificação Técnica](spec.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Reservas](../10-reservas/)
- [Eventos - Criação](../04-eventos/creation.md)
