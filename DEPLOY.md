# 🚀 Deploy VideoPreProd AI

## ✅ Stato Build
**Build locale:** COMPLETATO ✅
- 12 pagine statiche generate
- 2 API routes dinamiche
- Zero errori

---

## Opzione 1: Deploy su Vercel (Consigliata - Gratis)

### Passaggi:

1. **Crea repo GitHub**
   ```bash
   # Da fare manualmente su github.com
   # Crea repo: VideoPreProdAI-MVP
   ```

2. **Push codice**
   ```bash
   cd videopreprod-ai
   git remote add origin https://github.com/TUO_USERNAME/VideoPreProdAI-MVP.git
   git branch -M main
   git push -u origin main
   ```

3. **Connetti Vercel**
   - Vai su https://vercel.com
   - Importa progetto da GitHub
   - Framework: Next.js
   - Deploy automatico

4. **Configura Environment Variables**
   Vai su Project Settings > Environment Variables:
   ```
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   OPENAI_API_KEY=your-key
   ```

---

## Opzione 2: Deploy su Netlify

1. Crea account su https://netlify.com
2. "Add new site" > "Import from Git"
3. Seleziona repo GitHub
4. Build command: `npm run build`
5. Publish directory: `dist` (o verifica in netlify.toml)

---

## Opzione 3: Test Locale (Subito)

```bash
cd videopreprod-ai
npm run dev
# Apri http://localhost:3000
```

---

## 📋 Checklist Pre-Deploy

- [ ] Repo GitHub creato
- [ ] Codice pushato
- [ ] Account Vercel/Netlify
- [ ] API Keys Google Cloud
- [ ] API Key OpenAI
- [ ] Environment Variables configurate
- [ ] Test login funzionante

---

## 🔗 URL Attesi Dopo Deploy

**Landing:** `https://tuo-dominio.vercel.app/`

**Dashboard:** `https://tuo-dominio.vercel.app/dashboard`

**Scripting:** `https://tuo-dominio.vercel.app/dashboard/scripting`

---

## ⚠️ Note Importanti

1. **API Keys**: Non committare mai `.env.local`!
2. **Callback URL**: Aggiorna Google OAuth con URL di produzione
3. **Database**: Per produzione, configura Supabase reale
4. **Stripe**: Se aggiungi pagamenti, crea account Stripe

---

## 🆘 Troubleshooting

**Errore "Cannot find module"**
→ Rimuovi `node_modules` e reinstalla: `rm -rf node_modules && npm install`

**Errore Build**
→ Verifica `package.json` abbia tutte le dipendenze

**Login non funziona**
→ Verifica GOOGLE_CLIENT_ID e callback URL in Google Cloud Console

---

## 📞 Supporto

Per problemi specifici, controlla:
- Next.js docs: https://nextjs.org/docs/deployment
- Vercel docs: https://vercel.com/docs
- GitHub Issues del repo

**Buon deploy! 🚀**
