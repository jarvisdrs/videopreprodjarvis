# Setup Autenticazione VideoPreProd AI

## Panoramica

L'autenticazione è gestita tramite **NextAuth.js v5 (Auth.js)** con provider **Google OAuth 2.0**.

## Struttura Files

```
projects/videopreprod-ai/
├── auth.ts                          # Configurazione NextAuth
├── middleware.ts                    # Protezione route
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts                 # API endpoint auth
│   ├── login/
│   │   └── page.tsx                 # Pagina login
│   └── dashboard/
│       └── layout.tsx               # Layout protetto
├── components/auth/
│   ├── index.ts                     # Esportazioni
│   ├── google-signin-button.tsx     # Bottone login Google
│   ├── user-menu.tsx                # Menu utente con logout
│   ├── protected-route.tsx          # Wrapper protezione route
│   └── session-provider.tsx         # Provider sessione
└── lib/auth.ts                      # Helper functions
```

## Configurazione Google Cloud Console

### 1. Crea un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca sul selettore progetto in alto e seleziona "New Project"
3. Dai un nome al progetto (es. "VideoPreProd AI")
4. Clicca "Create"

### 2. Abilita Google OAuth 2.0 API

1. Nel menu di navigazione, vai su **APIs & Services > Library**
2. Cerca "Google+ API" o "Google Identity Toolkit"
3. Clicca e poi "Enable"

### 3. Configura OAuth Consent Screen

1. Vai su **APIs & Services > OAuth consent screen**
2. Seleziona **External** (per testare con qualsiasi account Google)
3. Clicca "Create"
4. Compila:
   - **App name**: VideoPreProd AI
   - **User support email**: (tua email)
   - **Developer contact information**: (tua email)
5. Clicca "Save and Continue"
6. Nella sezione **Scopes**, clicca "Add or Remove Scopes"
7. Aggiungi:
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`
   - `openid`
8. Clicca "Update" e poi "Save and Continue"
9. In **Test users**, aggiungi gli email che userai per testare
10. Clicca "Save and Continue"

### 4. Crea Credentials OAuth 2.0

1. Vai su **APIs & Services > Credentials**
2. Clicca **Create Credentials > OAuth client ID**
3. Seleziona **Web application**
4. Nome: "VideoPreProd AI Web Client"
5. **Authorized JavaScript origins**:
   - `http://localhost:3000` (sviluppo)
   - `https://tuo-dominio.com` (produzione)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (sviluppo)
   - `https://tuo-dominio.com/api/auth/callback/google` (produzione)
7. Clicca "Create"
8. **IMPORTANTE**: Salva subito **Client ID** e **Client Secret**

## Variabili d'Ambiente

Crea o aggiorna il file `.env.local`:

```bash
# NextAuth Configuration
AUTH_SECRET="tuo-secret-key-lungo-e-casuale-per-criptare-i-token"
AUTH_URL="http://localhost:3000"  # O il tuo dominio in produzione

# Google OAuth
GOOGLE_CLIENT_ID="tuo-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tuo-google-client-secret"

# Database (già configurato)
DATABASE_URL="postgresql://user:pass@localhost:5432/videopreprod"
```

Genera un AUTH_SECRET sicuro:
```bash
openssl rand -base64 32
```

## Callback URLs

### Sviluppo (localhost:3000)
- **Origine**: `http://localhost:3000`
- **Callback**: `http://localhost:3000/api/auth/callback/google`

### Produzione
- **Origine**: `https://tuo-dominio.com`
- **Callback**: `https://tuo-dominio.com/api/auth/callback/google`

## Installazione Dipendenze

```bash
npm install next-auth@beta @auth/prisma-adapter
# o
yarn add next-auth@beta @auth/prisma-adapter
```

## Test Login Flow

1. **Avvia il server**:
   ```bash
   npm run dev
   ```

2. **Vai alla pagina di login**:
   ```
   http://localhost:3000/login
   ```

3. **Clicca "Continua con Google"**

4. **Seleziona l'account Google** (deve essere nella lista test users)

5. **Dovresti essere reindirizzato alla dashboard**

6. **Verifica nel database**:
   ```sql
   SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 1;
   ```

## Ruoli Utente

Il sistema supporta 3 ruoli definiti in `schema.prisma`:

- `USER` - Utente standard (default)
- `MANAGER` - Manager con privilegi aggiuntivi
- `ADMIN` - Amministratore con accesso completo

### Cambiare ruolo utente

```sql
-- Promuovere utente a admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'utente@example.com';
```

## Protezione Route

### Middleware (automatico)
Il file `middleware.ts` protegge automaticamente:
- `/dashboard/*`
- `/api/protected/*`
- `/projects/*`
- `/scripts/*`
- `/tasks/*`
- `/team/*`
- `/budget/*`
- `/locations/*`

### Server-side protection
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  return <div>Contenuto protetto</div>
}
```

### Client-side protection
```typescript
"use client"

import { ProtectedRoute } from "@/components/auth"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div>Solo per admin</div>
    </ProtectedRoute>
  )
}
```

## Helper Functions

```typescript
import { 
  getCurrentUser, 
  requireAuth, 
  checkRole,
  requireRole,
  isAdmin,
  requireAdmin 
} from "@/lib/auth"

// Ottieni utente corrente (può essere null)
const user = await getCurrentUser()

// Richiedi autenticazione (redirect se non loggato)
const user = await requireAuth()

// Verifica ruolo
const isManager = await checkRole(["ADMIN", "MANAGER"])

// Richiedi ruolo specifico
const admin = await requireAdmin()
```

## Troubleshooting

### "redirect_uri_mismatch"
- **Causa**: URL di callback non configurato correttamente in Google Cloud Console
- **Soluzione**: Verifica che `http://localhost:3000/api/auth/callback/google` sia nei "Authorized redirect URIs"

### "unauthorized_client"
- **Causa**: Client ID o Client Secret errati
- **Soluzione**: Verifica le variabili d'ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET

### Utente non creato nel database
- **Causa**: Prisma Adapter non configurato correttamente
- **Soluzione**: Verifica che `@auth/prisma-adapter` sia installato e importato correttamente in `auth.ts`

### Sessione non persistente
- **Causa**: AUTH_SECRET mancante o errato
- **Soluzione**: Genera un nuovo secret con `openssl rand -base64 32` e aggiorna `.env.local`

### "Must be using Next.js 14 or higher"
- **Causa**: NextAuth v5 richiede Next.js 14+
- **Soluzione**: Aggiorna Next.js: `npm install next@latest`

### Dropdown menu non funziona
- **Causa**: Manca @radix-ui/react-dropdown-menu
- **Soluzione**: `npm install @radix-ui/react-dropdown-menu`

## Script di Test

```bash
# Verifica installazione
npm list next-auth @auth/prisma-adapter

# Test database connection
npx prisma studio

# Test auth endpoint
curl http://localhost:3000/api/auth/providers
```

## Documentazione

- [NextAuth.js v5 Docs](https://authjs.dev/reference/nextjs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
