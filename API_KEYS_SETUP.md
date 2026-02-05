# API Keys Configuration - VideoPreProd AI

## File di Configurazione

Copia questo file in `.env.local` e inserisci le tue API keys.

```bash
# ============================================
# VideoPreProd AI - Environment Variables
# ============================================

# -------------------------------------------------
# 1. GOOGLE OAUTH (Authentication)
# -------------------------------------------------
# Ottieni da: https://console.cloud.google.com/apis/credentials
# Istruzioni dettagliate sotto
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# -------------------------------------------------
# 2. SUPABASE (Database)
# -------------------------------------------------
# Ottieni da: https://app.supabase.com/project/_/settings/api
# Crea progetto gratuito, poi Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# -------------------------------------------------
# 3. OPENAI (AI Scripting)
# -------------------------------------------------
# Ottieni da: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key

# -------------------------------------------------
# 4. GOOGLE APIs (Calendar, Drive, Sheets, Docs)
# -------------------------------------------------
# Stesso progetto Google Cloud di OAuth
# Abilita API: Calendar API, Drive API, Sheets API, Docs API
GOOGLE_API_KEY=your-google-api-key-for-services

# -------------------------------------------------
# 5. OPTIONAL: Zapier (Integrazioni gestionali)
# -------------------------------------------------
# Per webhook con StudioBinder, Celtx, etc.
# https://zapier.com/app/zaps
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your/webhook
```

---

## 🚀 Come Ottenere le API Keys

### 1. Google OAuth (NextAuth)

**Passaggi:**
1. Vai su https://console.cloud.google.com/
2. Crea nuovo progetto (es. "VideoPreProd AI")
3. Vai su "APIs & Services" > "Credentials"
4. Clicca "Create Credentials" > "OAuth client ID"
5. Seleziona "Web application"
6. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://tuo-dominio.vercel.app/api/auth/callback/google` (prod)
7. Copia **Client ID** e **Client Secret**

**Abilita API necessarie:**
- Google Calendar API
- Google Drive API  
- Google Sheets API
- Google Docs API

---

### 2. Supabase (Database)

**Passaggi:**
1. Vai su https://supabase.com
2. Crea account (gratuito)
3. Crea nuovo progetto
4. Vai su Project Settings > API
5. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

**Schema Database da creare:**
```sql
-- Progetti
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Script/Outline
CREATE TABLE scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  content TEXT,
  outline JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks/Scheduling
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  due_date TIMESTAMP,
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budget
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  category TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  notes TEXT
);

-- Locations
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  cost_per_day DECIMAL(10,2),
  availability JSONB
);

-- Team Members
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  hourly_rate DECIMAL(10,2)
);
```

---

### 3. OpenAI

**Passaggi:**
1. Vai su https://platform.openai.com
2. Crea account (richiede verifica telefono)
3. Vai su "API Keys"
4. Clicca "Create new secret key"
5. Copia la key (visibile solo una volta!)

**Costi:** ~$0.002 per 1K tokens (GPT-3.5)

---

### 4. Zapier (Opzionale - per integrazioni)

**Per connettere StudioBinder, Celtx, etc.:**
1. Crea account su https://zapier.com
2. Crea nuovo Zap
3. Trigger: Webhook (Catch Hook)
4. Action: StudioBinder / Celtx / etc.
5. Copia l'URL del webhook

---

## 🔒 Sicurezza

- **Mai committare** il file `.env.local` (già in `.gitignore`)
- Rotazione keys ogni 90 giorni
- Usare `NEXT_PUBLIC_` solo per variabili client-safe
- `SUPABASE_SERVICE_ROLE_KEY` solo server-side!

## ✅ Checklist Setup

- [ ] Google Cloud Project creato
- [ ] OAuth Client ID configurato
- [ ] API Google abilitate
- [ ] Progetto Supabase creato
- [ ] Schema database creato
- [ ] API Key OpenAI generata
- [ ] File `.env.local` configurato
- [ ] Test login con Google
