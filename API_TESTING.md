# VideoPreProd AI - API Testing

> Comandi cURL per testare le API

## Prerequisiti

1. Ottieni un session token valido:
   - Login via browser
   - Apri DevTools → Application → Cookies
   - Copia il valore di `next-auth.session-token`

2. Esporta il token:
   ```bash
   export SESSION_TOKEN="il_tuo_token_qui"
   export BASE_URL="http://localhost:3000/api"
   ```

---

## Projects API

### Lista progetti
```bash
curl "$BASE_URL/projects?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Crea progetto
```bash
curl -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "name": "Documentario Test",
    "description": "Descrizione di test",
    "status": "DRAFT",
    "totalBudget": 50000,
    "currency": "EUR",
    "genre": "Documentario",
    "duration": 45,
    "format": "16:9"
  }'
```

### Dettaglio progetto
```bash
curl "$BASE_URL/projects/PROJECT_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Aggiorna progetto
```bash
curl -X PUT "$BASE_URL/projects/PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "name": "Documentario Test Aggiornato",
    "status": "PLANNING"
  }'
```

### Elimina progetto (soft delete)
```bash
curl -X DELETE "$BASE_URL/projects/PROJECT_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Statistiche progetto
```bash
curl "$BASE_URL/projects/PROJECT_ID/stats" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

---

## Scripts API

### Lista script
```bash
curl "$BASE_URL/projects/PROJECT_ID/scripts" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Crea script
```bash
curl -X POST "$BASE_URL/projects/PROJECT_ID/scripts" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "title": "Outline Principale",
    "content": "FADE IN:\n\nINT. MUSEO - GIORNO\n\nIl museo si sveglia lentamente...",
    "type": "OUTLINE",
    "status": "DRAFT",
    "logline": "Un viaggio nel cuore del Mediterraneo"
  }'
```

### Dettaglio script
```bash
curl "$BASE_URL/projects/PROJECT_ID/scripts/SCRIPT_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Aggiorna script
```bash
curl -X PUT "$BASE_URL/projects/PROJECT_ID/scripts/SCRIPT_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "status": "REVIEW",
    "content": "Contenuto aggiornato..."
  }'
```

### Elimina script
```bash
curl -X DELETE "$BASE_URL/projects/PROJECT_ID/scripts/SCRIPT_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Genera script con AI
```bash
curl -X POST "$BASE_URL/scripts/generate" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "projectId": "PROJECT_ID",
    "prompt": "Un documentario sulla vita marina nel Mediterraneo",
    "type": "OUTLINE",
    "tone": "documentary",
    "duration": 30
  }'
```

---

## Tasks API

### Lista task
```bash
curl "$BASE_URL/projects/PROJECT_ID/tasks?status=TODO&priority=HIGH" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Crea task
```bash
curl -X POST "$BASE_URL/projects/PROJECT_ID/tasks" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "title": "Scout location lago",
    "description": "Trovare location sul lago di Como",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2024-12-31T00:00:00.000Z"
  }'
```

### Dettaglio task
```bash
curl "$BASE_URL/projects/PROJECT_ID/tasks/TASK_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Aggiorna task
```bash
curl -X PUT "$BASE_URL/projects/PROJECT_ID/tasks/TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Elimina task
```bash
curl -X DELETE "$BASE_URL/projects/PROJECT_ID/tasks/TASK_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Kanban board
```bash
curl "$BASE_URL/projects/PROJECT_ID/tasks/kanban" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Update Kanban (drag & drop)
```bash
curl -X PATCH "$BASE_URL/projects/PROJECT_ID/tasks/kanban" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "updates": [
      { "taskId": "TASK_ID_1", "status": "IN_PROGRESS" },
      { "taskId": "TASK_ID_2", "status": "COMPLETED" }
    ]
  }'
```

---

## Budget API

### Lista voci budget
```bash
curl "$BASE_URL/projects/PROJECT_ID/budget" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Crea voce budget
```bash
curl -X POST "$BASE_URL/projects/PROJECT_ID/budget" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "category": "EQUIPMENT",
    "item": "Camera Sony FX6",
    "description": "Noleggio giornaliero",
    "estimated": 250,
    "actual": 250,
    "quantity": 5,
    "unitCost": 50,
    "status": "PAID",
    "vendor": "Rental Company Srl",
    "invoice": "INV-001"
  }'
```

### Riepilogo budget
```bash
curl "$BASE_URL/projects/PROJECT_ID/budget/summary" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

---

## Team API

### Lista membri team
```bash
curl "$BASE_URL/projects/PROJECT_ID/team" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Aggiungi membro team
```bash
curl -X POST "$BASE_URL/projects/PROJECT_ID/team" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "role": "DOP",
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "phone": "+39 123 456 7890",
    "dailyRate": 500,
    "currency": "EUR"
  }'
```

### Rimuovi membro team
```bash
curl -X DELETE "$BASE_URL/projects/PROJECT_ID/team/MEMBER_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

---

## Locations API

### Lista location
```bash
curl "$BASE_URL/projects/PROJECT_ID/locations" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Crea location
```bash
curl -X POST "$BASE_URL/projects/PROJECT_ID/locations" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "name": "Villa sul Lago",
    "address": "Via del Lago 123",
    "city": "Como",
    "country": "Italia",
    "type": "EXTERIOR",
    "description": "Villa storica con vista sul lago",
    "amenities": ["parking", "power", "wifi"],
    "costPerDay": 500,
    "status": "SCOUTING"
  }'
```

### Aggiorna location
```bash
curl -X PUT "$BASE_URL/projects/PROJECT_ID/locations/LOC_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "status": "BOOKED"
  }'
```

### Elimina location
```bash
curl -X DELETE "$BASE_URL/projects/PROJECT_ID/locations/LOC_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

---

## Script di test automatico

Salva come `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"
SESSION_TOKEN="$1"

if [ -z "$SESSION_TOKEN" ]; then
  echo "Usage: ./test-api.sh <session_token>"
  exit 1
fi

echo "=== Testing VideoPreProd API ==="

# Create project
echo -e "\n1. Creating project..."
PROJECT=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"name":"Test Project","description":"API Test","totalBudget":10000}')
echo "$PROJECT" | jq '.data.id' -r
PROJECT_ID=$(echo "$PROJECT" | jq '.data.id' -r)

# Get project
echo -e "\n2. Getting project..."
curl -s "$BASE_URL/projects/$PROJECT_ID" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" | jq '.data.name'

# Get project stats
echo -e "\n3. Getting project stats..."
curl -s "$BASE_URL/projects/$PROJECT_ID/stats" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" | jq '.data.overview'

# Create task
echo -e "\n4. Creating task..."
TASK=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/tasks" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"title":"Test Task","priority":"HIGH"}')
TASK_ID=$(echo "$TASK" | jq '.data.id' -r)
echo "Task ID: $TASK_ID"

# Create script
echo -e "\n5. Creating script..."
SCRIPT=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/scripts" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"title":"Test Script","content":"Test content","type":"OUTLINE"}')
SCRIPT_ID=$(echo "$SCRIPT" | jq '.data.id' -r)
echo "Script ID: $SCRIPT_ID"

# Create budget item
echo -e "\n6. Creating budget item..."
BUDGET=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/budget" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"category":"EQUIPMENT","item":"Camera","estimated":500}')
echo "$BUDGET" | jq '.data.item'

echo -e "\n=== Tests completed ==="
```

Rendi eseguibile e usa:
```bash
chmod +x test-api.sh
./test-api.sh "il_tuo_session_token"
```

---

## Note

- Sostituisci `PROJECT_ID`, `SCRIPT_ID`, `TASK_ID`, `MEMBER_ID`, `LOC_ID` con ID reali
- Usa `jq` per formattare JSON: `curl ... | jq`
- Per debug aggiungi `-v` a curl per vedere headers completi
