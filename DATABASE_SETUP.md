# VideoPreProd AI - Database Setup

## Configurazione Database Supabase + Prisma

### 1. Creazione Progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com) e crea un account
2. Clicca "New Project"
3. Inserisci:
   - **Organization**: La tua org o personale
   - **Project name**: `videopreprod-ai` (o nome preferito)
   - **Database Password**: Genera una password sicura (salvala in password manager)
   - **Region**: `West Europe (eu-west-3)` per hosting EU
4. Attendi il provisioning del database (~2 minuti)

### 2. Ottieni Connection String

1. Nel progetto Supabase, vai su **Project Settings** → **Database**
2. Scorri a **Connection String** → **URI**
3. Copia la stringa di connessione
4. Sostituisci `[YOUR-PASSWORD]` con la password del database

Esempio:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres
```

### 3. Configura Environment

Crea file `.env.local` nella root del progetto:

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres"

# Supabase (per storage e auth)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# OAuth (opzionale)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

> **Nota**: Trovi `SUPABASE_SERVICE_ROLE_KEY` in Project Settings → API → service_role key

### 4. Installazione Dipendenze

```bash
# Installa dipendenze Prisma e Supabase
npm install @prisma/client @supabase/supabase-js
npm install -D prisma

# O con pnpm
pnpm add @prisma/client @supabase/supabase-js
pnpm add -D prisma
```

### 5. Comandi Prisma

#### Genera il client Prisma
```bash
npx prisma generate
```

#### Esegui la prima migrazione
```bash
npx prisma migrate dev --name init
```

#### Reset database (ATTENZIONE: cancella tutti i dati)
```bash
npx prisma migrate reset
```

#### Apri Prisma Studio (GUI per database)
```bash
npx prisma studio
```
Studio sarà disponibile su: http://localhost:5555

#### Deploy migrazioni in produzione
```bash
npx prisma migrate deploy
```

#### Verifica stato migrazioni
```bash
npx prisma migrate status
```

### 6. Row Level Security (RLS)

In Supabase Dashboard → SQL Editor, esegui:

```sql
-- Abilita RLS su tutte le tabelle
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Script" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;

-- Policy: Users possono vedere solo i propri progetti
CREATE POLICY "Users can view own projects" ON "Project"
  FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can create own projects" ON "Project"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own projects" ON "Project"
  FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own projects" ON "Project"
  FOR DELETE USING ("userId" = auth.uid()::text);
```

### 7. Storage Bucket Setup

Per i file multimediali:

```sql
-- Crea bucket per i file del progetto
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false);

-- Policy per accesso ai file
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-files' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
  );
```

## Query Examples

### Creare un progetto
```typescript
import { prisma } from '@/lib/prisma'

const project = await prisma.project.create({
  data: {
    name: 'Spot Pubblicitario Estate 2024',
    description: 'Campagna pubblicitaria per nuova linea estiva',
    status: 'PLANNING',
    totalBudget: 25000,
    deadline: new Date('2024-06-15'),
    userId: 'user_id_here',
  },
})
```

### Ottenere progetti con conteggio
```typescript
const projects = await prisma.project.findMany({
  where: { 
    userId: currentUserId,
    deletedAt: null,
  },
  include: {
    _count: {
      select: { tasks: true, scripts: true, teamMembers: true }
    }
  }
})
```

### Creare task con assegnazione
```typescript
const task = await prisma.task.create({
  data: {
    title: 'Scout location centro storico',
    description: 'Trovare 3 location nel centro storico',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date('2024-03-20'),
    projectId: 'project_id_here',
    assignedToId: 'user_id_here',
  },
})
```

### Budget tracking
```typescript
const budget = await prisma.budget.aggregate({
  where: { projectId: 'project_id_here' },
  _sum: { estimated: true, actual: true },
})

const remaining = budget._sum.estimated! - (budget._sum.actual || 0)
```

### Scene e Shot List
```typescript
const script = await prisma.script.create({
  data: {
    title: 'Script Principale',
    type: 'SCREENPLAY',
    projectId: 'project_id_here',
    scenes: {
      create: [
        {
          number: 1,
          heading: 'INT. SALA RIUNIONI - GIORNO',
          content: 'La squadra si riunisce per la prima riunione...',
          shots: {
            create: [
              { number: '1A', description: 'Wide shot sala', shotType: 'WIDE' },
              { number: '1B', description: 'Close-up protagonista', shotType: 'CU' },
            ]
          }
        }
      ]
    }
  }
})
```

## Troubleshooting

### Errore: "P1001: Can't reach database"
- Verifica che DATABASE_URL sia corretta
- Controlla firewall/connection pooler in Supabase
- Prova con `?pgbouncer=true` alla fine dell'URL

### Errore: "P3005: Database schema is not empty"
- Esegui `npx prisma migrate reset` per pulire
- Oppure usa `npx prisma db push` per prototipazione

### Errore: "connect ECONNREFUSED"
- Verifica che il progetto Supabase sia attivo
- Controlla che non ci siano restrizioni IP

## Useful Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
