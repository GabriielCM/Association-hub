---
module: reservas
document: api
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Reservas - API

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Listar Reservas](#listar-reservas)
  - [Obter Reserva](#obter-reserva)
  - [Criar Reserva](#criar-reserva)
  - [Aprovar Reserva](#aprovar-reserva)
  - [Rejeitar Reserva](#rejeitar-reserva)
  - [Cancelar Reserva](#cancelar-reserva)
  - [Minhas Reservas](#minhas-reservas)
  - [Reservas Pendentes](#reservas-pendentes)
  - [Entrar na Fila](#entrar-na-fila)
  - [Sair da Fila](#sair-da-fila)
  - [Confirmar Vaga da Fila](#confirmar-vaga-da-fila)
  - [Minha Posição na Fila](#minha-posição-na-fila)
- [Modelos de Dados](#modelos-de-dados)
- [Códigos de Erro](#códigos-de-erro)

---

## Visão Geral

Base URL: `/api/v1/reservas`

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/` | Listar reservas | Gerente, ADM |
| GET | `/:id` | Obter reserva | Autenticado |
| POST | `/` | Criar reserva | Autenticado |
| POST | `/:id/aprovar` | Aprovar reserva | Gerente, ADM |
| POST | `/:id/rejeitar` | Rejeitar reserva | Gerente, ADM |
| POST | `/:id/cancelar` | Cancelar reserva | Autenticado |
| GET | `/minhas` | Minhas reservas | Autenticado |
| GET | `/pendentes` | Reservas pendentes | Gerente, ADM |
| POST | `/fila` | Entrar na fila de espera | Autenticado |
| DELETE | `/fila/:id` | Sair da fila | Autenticado |
| POST | `/fila/:id/confirmar` | Confirmar vaga | Autenticado |
| GET | `/fila/posicao` | Minha posição na fila | Autenticado |

---

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token.

```
Authorization: Bearer <token>
```

---

## Endpoints

### Listar Reservas

Lista todas as reservas com filtros. Disponível apenas para Gerente e ADM.

**Request:**
```http
GET /api/v1/reservas
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `espaco_id` | uuid | Não | Filtrar por espaço |
| `status` | string | Não | Filtrar por status |
| `data_inicio` | date | Não | Data inicial (YYYY-MM-DD) |
| `data_fim` | date | Não | Data final (YYYY-MM-DD) |
| `usuario_id` | uuid | Não | Filtrar por usuário |
| `page` | integer | Não | Página (default: 1) |
| `limit` | integer | Não | Itens por página (default: 20, max: 50) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "espaco": {
        "id": "uuid",
        "nome": "Churrasqueira 1"
      },
      "usuario": {
        "id": "uuid",
        "nome": "João Silva"
      },
      "data": "2026-01-20",
      "periodo": "dia",
      "turno": null,
      "hora_inicio": null,
      "hora_fim": null,
      "status": "pendente",
      "created_at": "2026-01-12T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### Obter Reserva

Retorna detalhes de uma reserva específica.

**Request:**
```http
GET /api/v1/reservas/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "espaco": {
    "id": "uuid",
    "nome": "Churrasqueira 1",
    "foto_principal": "https://cdn.example.com/espacos/churrasqueira1.jpg"
  },
  "usuario": {
    "id": "uuid",
    "nome": "João Silva"
  },
  "data": "2026-01-20",
  "periodo": "dia",
  "turno": null,
  "hora_inicio": null,
  "hora_fim": null,
  "status": "pendente",
  "taxa": 150.00,
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z",
  "aprovado_por": null,
  "aprovado_em": null,
  "cancelado_por": null,
  "cancelado_em": null,
  "motivo_cancelamento": null
}
```

**Permissões:**
- Funcionário: só pode ver próprias reservas
- Gerente/ADM: pode ver todas

**Response (403):**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não tem permissão para ver esta reserva"
  }
}
```

---

### Criar Reserva

Cria uma nova solicitação de reserva.

**Request:**
```http
POST /api/v1/reservas
Content-Type: application/json
```

**Body (Dia inteiro):**
```json
{
  "espaco_id": "uuid",
  "data": "2026-01-20"
}
```

**Body (Turno):**
```json
{
  "espaco_id": "uuid",
  "data": "2026-01-20",
  "turno": "Manhã"
}
```

**Body (Hora):**
```json
{
  "espaco_id": "uuid",
  "data": "2026-01-20",
  "hora_inicio": "14:00",
  "hora_fim": "18:00"
}
```

**Validações:**

| Regra | Mensagem de erro |
|-------|------------------|
| Espaço deve existir e estar ativo | "Espaço não encontrado ou indisponível" |
| Data deve ser futura | "Data deve ser no futuro" |
| Respeitar antecedência mínima | "Reserve com pelo menos X dias de antecedência" |
| Respeitar antecedência máxima | "Reserve até Y dias no futuro" |
| Respeitar intervalo entre locações | "Você poderá reservar novamente a partir de [data]" |
| Data não pode estar bloqueada | "Esta data está bloqueada" |
| Espaço não pode estar em manutenção | "Espaço em manutenção" |
| Não pode haver conflito | "Já existe uma reserva para esta data" |
| Espaços relacionados disponíveis | "Espaço [X] está bloqueado nesta data" |

**Response (201):**
```json
{
  "id": "uuid",
  "espaco_id": "uuid",
  "data": "2026-01-20",
  "status": "pendente",
  "message": "Reserva criada com sucesso. Aguarde aprovação.",
  "created_at": "2026-01-12T15:00:00Z"
}
```

**Response (409 - Conflito):**
```json
{
  "error": {
    "code": "DATA_OCUPADA",
    "message": "Já existe uma reserva para esta data",
    "fila_disponivel": true,
    "posicao_fila": 3
  }
}
```

---

### Aprovar Reserva

Aprova uma reserva pendente.

**Request:**
```http
POST /api/v1/reservas/:id/aprovar
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "aprovado",
  "aprovado_por": {
    "id": "uuid",
    "nome": "Admin"
  },
  "aprovado_em": "2026-01-12T16:00:00Z",
  "message": "Reserva aprovada com sucesso"
}
```

**Response (400):**
```json
{
  "error": {
    "code": "STATUS_INVALIDO",
    "message": "Apenas reservas pendentes podem ser aprovadas"
  }
}
```

---

### Rejeitar Reserva

Rejeita uma reserva pendente.

**Request:**
```http
POST /api/v1/reservas/:id/rejeitar
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "rejeitado",
  "rejeitado_por": {
    "id": "uuid",
    "nome": "Admin"
  },
  "rejeitado_em": "2026-01-12T16:00:00Z",
  "message": "Reserva rejeitada",
  "fila_notificada": true
}
```

---

### Cancelar Reserva

Cancela uma reserva.

**Request:**
```http
POST /api/v1/reservas/:id/cancelar
Content-Type: application/json
```

**Body (opcional para ADM):**
```json
{
  "motivo": "Motivo do cancelamento"
}
```

**Regras:**
- Funcionário: pode cancelar próprias reservas (pendentes ou aprovadas até 24h antes)
- ADM: pode cancelar qualquer reserva a qualquer momento

**Response (200):**
```json
{
  "id": "uuid",
  "status": "cancelado",
  "cancelado_por": {
    "id": "uuid",
    "nome": "João Silva"
  },
  "cancelado_em": "2026-01-12T17:00:00Z",
  "message": "Reserva cancelada com sucesso",
  "fila_notificada": true
}
```

**Response (400 - Prazo expirado):**
```json
{
  "error": {
    "code": "PRAZO_CANCELAMENTO_EXPIRADO",
    "message": "Não é possível cancelar com menos de 24h de antecedência"
  }
}
```

---

### Minhas Reservas

Lista as reservas do usuário autenticado.

**Request:**
```http
GET /api/v1/reservas/minhas
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `status` | string | Não | Filtrar por status |
| `tipo` | string | Não | `ativas` (pendente/aprovado) ou `historico` |
| `page` | integer | Não | Página (default: 1) |
| `limit` | integer | Não | Itens por página (default: 20) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "espaco": {
        "id": "uuid",
        "nome": "Churrasqueira 1",
        "foto_principal": "https://cdn.example.com/espacos/churrasqueira1.jpg"
      },
      "data": "2026-01-20",
      "periodo": "dia",
      "status": "pendente",
      "pode_cancelar": true,
      "created_at": "2026-01-12T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### Reservas Pendentes

Lista reservas aguardando aprovação. Disponível para Gerente e ADM.

**Request:**
```http
GET /api/v1/reservas/pendentes
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `espaco_id` | uuid | Não | Filtrar por espaço |
| `page` | integer | Não | Página (default: 1) |
| `limit` | integer | Não | Itens por página (default: 20) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "espaco": {
        "id": "uuid",
        "nome": "Churrasqueira 1"
      },
      "usuario": {
        "id": "uuid",
        "nome": "João Silva",
        "avatar": "https://cdn.example.com/avatars/joao.jpg"
      },
      "data": "2026-01-20",
      "periodo": "dia",
      "taxa": 150.00,
      "created_at": "2026-01-12T10:00:00Z",
      "tempo_pendente": "2h 30min"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "total_pages": 1
  },
  "total_pendentes": 8
}
```

---

### Entrar na Fila

Entra na fila de espera para uma data ocupada.

**Request:**
```http
POST /api/v1/reservas/fila
Content-Type: application/json
```

**Body:**
```json
{
  "espaco_id": "uuid",
  "data": "2026-01-20",
  "turno": null,
  "hora_inicio": null,
  "hora_fim": null
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "espaco_id": "uuid",
  "data": "2026-01-20",
  "posicao": 3,
  "message": "Você está na posição 3 da fila de espera",
  "created_at": "2026-01-12T18:00:00Z"
}
```

**Response (400):**
```json
{
  "error": {
    "code": "JA_NA_FILA",
    "message": "Você já está na fila de espera para esta data"
  }
}
```

**Response (400):**
```json
{
  "error": {
    "code": "FILA_CHEIA",
    "message": "A fila de espera está cheia (máximo 10 pessoas)"
  }
}
```

---

### Sair da Fila

Remove o usuário da fila de espera.

**Request:**
```http
DELETE /api/v1/reservas/fila/:id
```

**Response (200):**
```json
{
  "message": "Você saiu da fila de espera"
}
```

---

### Confirmar Vaga da Fila

Confirma interesse quando notificado de vaga disponível.

**Request:**
```http
POST /api/v1/reservas/fila/:id/confirmar
```

**Response (201):**
```json
{
  "reserva_id": "uuid",
  "status": "pendente",
  "message": "Reserva criada com sucesso. Aguarde aprovação."
}
```

**Response (400 - Expirado):**
```json
{
  "error": {
    "code": "PRAZO_EXPIRADO",
    "message": "O prazo para confirmar expirou"
  }
}
```

**Response (400 - Regra não atendida):**
```json
{
  "error": {
    "code": "INTERVALO_NAO_RESPEITADO",
    "message": "Você poderá reservar este espaço a partir de [data]"
  }
}
```

---

### Minha Posição na Fila

Retorna as posições do usuário em todas as filas de espera.

**Request:**
```http
GET /api/v1/reservas/fila/posicao
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `espaco_id` | uuid | Não | Filtrar por espaço |

**Response (200):**
```json
{
  "filas": [
    {
      "id": "uuid",
      "espaco": {
        "id": "uuid",
        "nome": "Churrasqueira 1"
      },
      "data": "2026-01-20",
      "posicao": 3,
      "total_na_fila": 5,
      "notificado": false,
      "expira_em": null,
      "created_at": "2026-01-12T18:00:00Z"
    },
    {
      "id": "uuid",
      "espaco": {
        "id": "uuid",
        "nome": "Salão de Festas"
      },
      "data": "2026-01-25",
      "posicao": 1,
      "total_na_fila": 2,
      "notificado": true,
      "expira_em": "2026-01-13T18:00:00Z",
      "created_at": "2026-01-10T10:00:00Z"
    }
  ]
}
```

---

## Modelos de Dados

### Reserva

```typescript
interface Reserva {
  id: string;
  espaco_id: string;
  usuario_id: string;
  data: string; // YYYY-MM-DD
  periodo: 'dia' | 'turno' | 'hora';
  turno: string | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  taxa: number | null;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado' | 'expirado' | 'concluido';
  aprovado_por: string | null;
  aprovado_em: string | null;
  rejeitado_por: string | null;
  rejeitado_em: string | null;
  cancelado_por: string | null;
  cancelado_em: string | null;
  motivo_cancelamento: string | null;
  created_at: string;
  updated_at: string;
}
```

### FilaEspera

```typescript
interface FilaEspera {
  id: string;
  espaco_id: string;
  usuario_id: string;
  data: string;
  periodo: 'dia' | 'turno' | 'hora';
  turno: string | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  posicao: number;
  notificado_em: string | null;
  expira_em: string | null;
  created_at: string;
}
```

### ReservaResumida (para listagem)

```typescript
interface ReservaResumida {
  id: string;
  espaco: {
    id: string;
    nome: string;
    foto_principal?: string;
  };
  usuario?: {
    id: string;
    nome: string;
    avatar?: string;
  };
  data: string;
  periodo: 'dia' | 'turno' | 'hora';
  turno?: string;
  hora_inicio?: string;
  hora_fim?: string;
  status: string;
  taxa?: number;
  pode_cancelar?: boolean;
  created_at: string;
}
```

---

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `RESERVA_NOT_FOUND` | 404 | Reserva não encontrada |
| `ESPACO_NOT_FOUND` | 404 | Espaço não encontrado |
| `ESPACO_INATIVO` | 400 | Espaço não está ativo |
| `ESPACO_MANUTENCAO` | 400 | Espaço em manutenção |
| `DATA_PASSADA` | 400 | Data deve ser no futuro |
| `ANTECEDENCIA_MINIMA` | 400 | Não respeita antecedência mínima |
| `ANTECEDENCIA_MAXIMA` | 400 | Não respeita antecedência máxima |
| `INTERVALO_LOCACAO` | 400 | Não respeita intervalo entre locações |
| `DATA_BLOQUEADA` | 400 | Data está bloqueada |
| `DATA_OCUPADA` | 409 | Já existe reserva para esta data |
| `ESPACO_RELACIONADO_OCUPADO` | 409 | Espaço relacionado está ocupado |
| `STATUS_INVALIDO` | 400 | Status não permite esta operação |
| `PRAZO_CANCELAMENTO_EXPIRADO` | 400 | Prazo para cancelamento expirou |
| `JA_NA_FILA` | 400 | Usuário já está na fila |
| `FILA_CHEIA` | 400 | Fila de espera está cheia |
| `NAO_NA_FILA` | 400 | Usuário não está na fila |
| `PRAZO_CONFIRMACAO_EXPIRADO` | 400 | Prazo para confirmar expirou |
| `FORBIDDEN` | 403 | Sem permissão para esta operação |
| `UNAUTHORIZED` | 401 | Token inválido ou expirado |

---

## Relacionados

- [README](README.md)
- [Especificação](spec.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Espaços - API](../09-espacos/api.md)
- [API Central](../api/endpoints-reference.md)
