# VideoPreProd AI - API Documentation

> REST API completa per la gestione progetti video pre-produzione
> Versione: 1.0.0
> Base URL: `http://localhost:3000/api`

---

## Indice

1. [Autenticazione](#autenticazione)
2. [Errori](#errori)
3. [Pagination](#pagination)
4. [Projects API](#projects-api)
5. [Scripts API](#scripts-api)
6. [Tasks API](#tasks-api)
7. [Budget API](#budget-api)
8. [Team API](#team-api)
9. [Locations API](#locations-api)
10. [Rate Limiting](#rate-limiting)

---

## Autenticazione

Tutte le API richiedono autenticazione via **NextAuth session cookie**.

```http
Cookie: next-auth.session-token=xxx
```

### Headers richiesti per POST/PUT/PATCH

```http
Content-Type: application/json
```

---

## Errori

### Codici di stato HTTP

| Codice | Significato | Descrizione |
|--------|-------------|-------------|
| 200 | OK | Richiesta completata con successo |
| 201 | Created | Risorsa creata con successo |
| 400 | Bad Request | Dati invalidi o malformati |
| 401 | Unauthorized | Autenticazione richiesta |
| 404 | Not Found | Risorsa non trovata |
| 409 | Conflict | Conflitto (es. duplicato) |
| 500 | Server Error | Errore interno del server |

### Formato errore

```json
{
  "error": "Messaggio di errore",
  "details": { /* dettagli validazione Zod */ }
}
```

---

## Pagination

Le liste supportano paginazione via query params:

| Parametro | Default | Max | Descrizione |
|-----------|---------|-----|-------------|
| `page` | 1 | - | Numero pagina |
| `limit` | 20 | 100 | Elementi per pagina |

### Risposta paginata

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Projects API

### GET `/projects`
Lista progetti dell'utente autenticato.

**Query Params:**
- `page` - Pagina (default: 1)
- `limit` - Elementi per pagina (default: 20)
- `status` - Filtra per status (DRAFT, PLANNING, ...)
- `search` - Ricerca testuale

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "Nome Progetto",
      "status": "DRAFT",
      "totalBudget": 50000,
      "currency": "EUR",
      "deadline": "2024-12-31T00:00:00.000Z",
      "_count": {
        "tasks": 10,
        "scripts": 2,
        "teamMembers": 5,
        "locations": 3
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

---

### POST `/projects`
Crea un nuovo progetto.

**Body:**
```json
{
  "name": "Nome Progetto",
  "description": "Descrizione dettagliata",
  "status": "DRAFT",
  "totalBudget": 50000,
  "currency": "EUR",
  "startDate": "2024-06-01T00:00:00.000Z",
  "deadline": "2024-12-31T00:00:00.000Z",
  "genre": "Documentario",
  "duration": 45,
  "format": "16:9",
  "target": "Pubblico giovane"
}
```

---

### GET `/projects/{id}`
Dettaglio progetto con relazioni.

**Response:**
```json
{
  "data": {
    "id": "cuid",
    "name": "Nome Progetto",
    "scripts": [...],
    "tasks": [...],
    "teamMembers": [...],
    "locations": [...],
    "_count": { "scripts": 2, "tasks": 10, "budgets": 15 }
  }
}
```

---

### PUT `/projects/{id}`
Aggiorna progetto.

**Body:** Stesso formato di POST (tutti i campi opzionali)

---

### DELETE `/projects/{id}`
Soft delete progetto e tutte le entità collegate.

**Response:**
```json
{ "success": true }
```

---

### GET `/projects/{id}/stats`
Statistiche dettagliate del progetto.

**Response:**
```json
{
  "data": {
    "overview": {
      "scripts": 2,
      "tasks": { "total": 10, "todo": 3, "inProgress": 4, "completed": 3 },
      "team": 5,
      "locations": 3
    },
    "budget": {
      "totalEstimated": 50000,
      "totalActual": 32000,
      "remaining": 18000,
      "byCategory": [...]
    },
    "recentActivity": {
      "tasks": [...],
      "upcomingDeadlines": [...]
    }
  }
}
```

---

## Scripts API

### GET `/projects/{id}/scripts`
Lista script del progetto.

**Query Params:**
- `page`, `limit`
- `type` - OUTLINE, TREATMENT, SCREENPLAY, ...
- `status` - DRAFT, OUTLINE, REVIEW, APPROVED, FINAL

---

### POST `/projects/{id}/scripts`
Crea uno script.

**Body:**
```json
{
  "title": "Titolo Script",
  "content": "Contenuto completo dello script...",
  "type": "SCREENPLAY",
  "status": "DRAFT",
  "logline": "One-liner",
  "synopsis": "Sinossi estesa",
  "notes": "Note interne"
}
```

---

### GET `/projects/{id}/scripts/{scriptId}`
Dettaglio script con scene e shot.

---

### PUT `/projects/{id}/scripts/{scriptId}`
Aggiorna script. Auto-incrementa versione se content cambia.

---

### DELETE `/projects/{id}/scripts/{scriptId}`
Soft delete script.

---

### POST `/scripts/generate`
Genera script usando AI.

**Body:**
```json
{
  "projectId": "cuid",
  "prompt": "Un documentario sulla vita marina nel Mediterraneo",
  "type": "OUTLINE",
  "tone": "documentary",
  "duration": 30
}
```

**Response:**
```json
{
  "data": { /* nuovo script */ },
  "meta": {
    "generated": true,
    "model": "gpt-4",
    "promptTokens": 150,
    "completionTokens": 800
  }
}
```

---

## Tasks API

### GET `/projects/{id}/tasks`
Lista task del progetto.

**Query Params:**
- `page`, `limit`
- `status` - TODO, IN_PROGRESS, BLOCKED, REVIEW, COMPLETED, CANCELLED
- `priority` - LOW, MEDIUM, HIGH, URGENT
- `assignedToId` - Filtra per assegnatario
- `parentOnly=true` - Solo task principali (no subtasks)

---

### POST `/projects/{id}/tasks`
Crea un task.

**Body:**
```json
{
  "title": "Titolo Task",
  "description": "Descrizione",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2024-06-01T00:00:00.000Z",
  "dueDate": "2024-06-15T00:00:00.000Z",
  "assignedToId": "user-cuid",
  "parentId": "parent-task-cuid"
}
```

---

### GET `/projects/{id}/tasks/{taskId}`
Dettaglio task con subtasks.

---

### PUT `/projects/{id}/tasks/{taskId}`
Aggiorna task. Auto-set completedAt quando status=COMPLETED.

---

### DELETE `/projects/{id}/tasks/{taskId}`
Soft delete task e subtasks.

---

### GET `/projects/{id}/tasks/kanban`
Board kanban con task raggruppate per status.

**Response:**
```json
{
  "data": {
    "columns": [
      { "id": "TODO", "title": "To Do", "color": "#6B7280", "tasks": [...] },
      { "id": "IN_PROGRESS", "title": "In Progress", "color": "#3B82F6", "tasks": [...] },
      ...
    ],
    "stats": {
      "total": 50,
      "byStatus": { "TODO": 10, "IN_PROGRESS": 20, ... },
      "overdue": 5,
      "dueThisWeek": 8
    }
  }
}
```

---

### PATCH `/projects/{id}/tasks/kanban`
Bulk update task positions (drag & drop).

**Body:**
```json
{
  "updates": [
    { "taskId": "cuid-1", "status": "IN_PROGRESS" },
    { "taskId": "cuid-2", "status": "COMPLETED" }
  ]
}
```

---

## Budget API

### GET `/projects/{id}/budget`
Lista voci di budget.

**Query Params:**
- `page`, `limit`
- `category` - PRE_PRODUCTION, PRODUCTION, POST_PRODUCTION, ...
- `status` - ESTIMATED, APPROVED, PENDING, PAID, OVER_BUDGET

---

### POST `/projects/{id}/budget`
Crea voce budget.

**Body:**
```json
{
  "category": "EQUIPMENT",
  "item": "Camera Sony FX6",
  "description": "Noleggio giornaliero",
  "estimated": 250,
  "actual": 250,
  "quantity": 5,
  "unitCost": 50,
  "status": "PAID",
  "paidDate": "2024-06-01T00:00:00.000Z",
  "vendor": "Rental Company Srl",
  "invoice": "INV-001"
}
```

---

### GET `/projects/{id}/budget/summary`
Riepilogo completo budget.

**Response:**
```json
{
  "data": {
    "summary": {
      "estimatedTotal": 50000,
      "actualTotal": 32000,
      "variance": -18000,
      "variancePercent": -36,
      "projectBudget": 50000,
      "budgetUtilization": 64,
      "status": "on_track"
    },
    "byCategory": [...],
    "byStatus": [...],
    "recentItems": [...],
    "largestItems": [...]
  }
}
```

---

## Team API

### GET `/projects/{id}/team`
Lista membri del team.

**Response:**
```json
{
  "data": [...],
  "stats": {
    "total": 5,
    "byRole": { "DIRECTOR": 1, "DOP": 1, ... },
    "totalDailyRate": 2500,
    "withUserAccount": 3
  }
}
```

---

### POST `/projects/{id}/team`
Aggiungi membro al team.

**Body:**
```json
{
  "role": "DOP",
  "customRole": "Director of Photography",
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 123 456 7890",
  "bio": "Bio...",
  "portfolio": "https://portfolio.com",
  "dailyRate": 500,
  "currency": "EUR",
  "userId": "user-cuid"
}
```

---

### DELETE `/projects/{id}/team/{memberId}`
Rimuovi membro dal team (soft delete).

---

## Locations API

### GET `/projects/{id}/locations`
Lista location.

**Query Params:**
- `page`, `limit`
- `status` - SCOUTING, CONTACTED, VISITED, NEGOTIATING, BOOKED, CONFIRMED, CANCELLED
- `type` - INTERIOR, EXTERIOR, STUDIO, GREEN_SCREEN, VIRTUAL
- `city` - Filtra per città

---

### POST `/projects/{id}/locations`
Crea location.

**Body:**
```json
{
  "name": "Villa sul Lago",
  "address": "Via del Lago 123",
  "city": "Como",
  "country": "Italia",
  "postalCode": "22100",
  "type": "EXTERIOR",
  "description": "Villa con vista lago...",
  "amenities": ["parking", "power", "wifi"],
  "dimensions": "20x30m",
  "contactName": "Proprietario",
  "contactEmail": "owner@example.com",
  "contactPhone": "+39 123 456 7890",
  "costPerDay": 500,
  "currency": "EUR",
  "status": "SCOUTING",
  "rating": 4,
  "notes": "Note scouting...",
  "photos": ["https://...", "https://..."]
}
```

---

### PUT `/projects/{id}/locations/{locId}`
Aggiorna location.

---

### DELETE `/projects/{id}/locations/{locId}`
Soft delete location.

---

## Rate Limiting

Implementazione consigliata con **Upstash Redis** o **Vercel KV**:

```typescript
// middleware.ts o nei route handlers
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

// Nel route handler
const { success } = await ratelimit.limit(session.user.id)
if (!success) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
}
```

---

## Testing con cURL

Vedi `API_TESTING.md` per la lista completa dei comandi di test.

---

## Changelog

### v1.0.0 (2024-02-05)
- ✨ API Projects completa
- ✨ API Scripts con AI generation
- ✨ API Tasks con Kanban board
- ✨ API Budget con summary
- ✨ API Team
- ✨ API Locations
- 🔐 Autenticazione NextAuth
- 📄 Validazione Zod
- 🗑️ Soft delete su tutte le entità
- 📊 Pagination e sorting

---

*Documentazione generata automaticamente per VideoPreProd AI*
