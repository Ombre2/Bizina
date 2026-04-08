# Sécurité — Bizina

## Architecture d'authentification

```
┌─────────────┐       POST /auth/login        ┌──────────────┐
│  Frontend   │ ─────────────────────────────► │   Backend    │
│  (React)    │ ◄───────────────────────────── │   (NestJS)   │
│             │   { access_token } (JSON)      │              │
│             │   + Set-Cookie: refresh_token  │              │
└──────┬──────┘     (HttpOnly, Strict)         └──────┬───────┘
       │                                              │
       │  Bearer access_token (mémoire)               │  JWT vérifié
       │  ───────────────────────────────────►        │  via JwtAuthGuard
       │                                              │
       │  Refresh (cookie auto par le browser)        │
       │  POST /auth/refresh ────────────────►        │  Valide le refresh_token
       │  ◄──────────────────────────────────         │  Retourne un nouveau
       │  { access_token } + nouveau cookie           │  access_token + cookie
```

---

## Tokens

### Access Token

| Propriété     | Valeur                                  |
|---------------|-----------------------------------------|
| Durée de vie  | 15 minutes (`JWT_EXPIRES_IN`)           |
| Stockage      | Variable JavaScript en mémoire (module) |
| Transmission  | Header `Authorization: Bearer <token>`  |
| Lisible par JS | Oui (variable module uniquement)       |
| Persistent    | Non — perdu au refresh de page          |

### Refresh Token

| Propriété     | Valeur                                           |
|---------------|--------------------------------------------------|
| Durée de vie  | 7 jours (`JWT_REFRESH_EXPIRES_IN`)               |
| Stockage      | Cookie HTTP                                      |
| Transmission  | Automatique par le navigateur (cookie)           |
| Lisible par JS | **Non** — `httpOnly: true`                      |
| Persistent    | Oui — survit au refresh de page                  |
| Scope cookie  | `path: /auth/refresh` uniquement                 |
| Protection CSRF | `sameSite: strict`                             |
| HTTPS only    | `secure: true` en production                     |

---

## Flux détaillés

### 1. Connexion (`POST /auth/login`)

```
Utilisateur → saisit username + password
           → Frontend envoie POST /auth/login (withCredentials: true)
           → Backend vérifie via bcrypt (coût 10)
           → Backend génère :
               - access_token (JWT, secret: JWT_SECRET, 15min)
               - refresh_token (JWT, secret: JWT_REFRESH_SECRET, 7j)
           → Backend retourne :
               - JSON: { access_token }
               - Cookie: refresh_token (HttpOnly, SameSite=Strict, Path=/auth/refresh)
           → Frontend stocke access_token en mémoire (setApiToken)
           → Frontend stocke user dans React state
```

### 2. Requête authentifiée

```
Frontend → interceptor Axios lit _authToken (variable module)
         → ajoute header Authorization: Bearer <access_token>
         → Backend vérifie via JwtAuthGuard + JwtStrategy (ConfigService)
         → Réponse retournée
```

### 3. Refresh silencieux (page reload)

```
Page rechargée → _authToken perdu (mémoire JS vidée)
              → AuthProvider.useEffect au montage
              → POST /auth/refresh (cookie envoyé automatiquement)
              → Backend lit le cookie, vérifie le refresh_token
              → Retourne un nouveau access_token + nouveau refresh_token (rotation)
              → Frontend : setApiToken(access_token) → GET /auth/profile → session restaurée
```

### 4. Token expiré (pendant utilisation)

```
Requête → Backend retourne 401
        → Interceptor Axios détecte le 401
        → setApiToken(null)
        → Si pas déjà sur /login → redirection vers /login
```

### 5. Déconnexion (`POST /auth/logout`)

```
Utilisateur clique "Déconnexion"
  → Frontend : setUser(null), setApiToken(null), isAuthenticated=false
  → POST /auth/logout (withCredentials: true)
  → Backend : clearCookie("refresh_token", { path: "/auth/refresh" })
  → Cookie effacé côté navigateur
```

---

## Protections contre les attaques

### XSS (Cross-Site Scripting)

| Mesure | Détail |
|--------|--------|
| Access token en mémoire | Jamais dans `localStorage`, `sessionStorage` ni le DOM |
| Refresh token HttpOnly | Invisible au JavaScript — même un script injecté ne peut pas le lire |
| Helmet | Headers de sécurité HTTP : `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` |

### CSRF (Cross-Site Request Forgery)

| Mesure | Détail |
|--------|--------|
| `sameSite: strict` | Le cookie refresh n'est jamais envoyé depuis un autre domaine |
| `path: /auth/refresh` | Le cookie n'est envoyé que vers cet endpoint précis |
| CORS restreint | Seule l'origine `FRONTEND_URL` est acceptée |

### Brute-Force

| Mesure | Détail |
|--------|--------|
| Rate limiting global | 100 requêtes / 60s par IP sur toute l'API (`ThrottlerModule`) |
| Rate limiting auth | 5 tentatives / 60s par IP sur `POST /auth/login` et `POST /auth/register` |
| Rate limiting refresh | 10 tentatives / 60s par IP sur `POST /auth/refresh` |
| Réponse 429 | `Too Many Requests` si limite dépassée |

### Injection SQL

| Mesure | Détail |
|--------|--------|
| TypeORM paramétré | Toutes les requêtes utilisent `:param` avec des objets de paramètres |
| Pas de SQL brut | Aucun `query()` ou template literal dans les requêtes |
| ValidationPipe | `whitelist: true`, `forbidNonWhitelisted: true` — propriétés inconnues rejetées |

### Validation des entrées

| Mesure | Détail |
|--------|--------|
| class-validator (backend) | Décorateurs `@IsString`, `@IsNotEmpty`, `@IsEmail`, etc. sur tous les DTO |
| Mot de passe fort | Min 8 chars, 1 majuscule, 1 chiffre, 1 caractère spécial — regex validé dans `RegisterDto` |
| maxLength (frontend) | Username max 50, password max 128 sur le formulaire de login |
| autoComplete | `username` et `current-password` pour aider les gestionnaires de mots de passe |

---

## Variables d'environnement requises

### Backend (`.env`)

```bash
# OBLIGATOIRE — Génération :
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<valeur_aleatoire_64_bytes>
JWT_EXPIRES_IN=15m

# OBLIGATOIRE — Valeur DIFFÉRENTE de JWT_SECRET
JWT_REFRESH_SECRET=<autre_valeur_aleatoire_64_bytes>
JWT_REFRESH_EXPIRES_IN=7d

# URL du frontend autorisé (CORS)
FRONTEND_URL=http://localhost:5173

# En production
NODE_ENV=production
```

### Frontend (`.env`)

```bash
# URL du backend
VITE_API_URL=http://localhost:3000
```

**L'application refuse de démarrer** si `JWT_SECRET`, `JWT_REFRESH_SECRET` ou `VITE_API_URL` sont absents.

---

## Fichiers concernés

### Backend (`Bizina/`)

| Fichier | Rôle |
|---------|------|
| `src/main.ts` | Helmet, cookie-parser, CORS restreint, Swagger conditionnel |
| `src/config/configuration.ts` | Fail-fast sur JWT_SECRET et JWT_REFRESH_SECRET |
| `src/config/jwt.strategy.ts` | Lecture du secret via ConfigService (pas process.env) |
| `src/config/jwt-auth.guard.ts` | Guard Passport appliqué sur les routes protégées |
| `src/app.module.ts` | ThrottlerModule global (100 req/min) + ThrottlerGuard |
| `src/modules/auth/auth.service.ts` | generateTokens(), signIn(), register(), refresh() |
| `src/modules/auth/auth.controller.ts` | Cookie HttpOnly sur login/register, endpoints refresh/logout |
| `src/modules/auth/dto/register.dto.ts` | Validation mot de passe fort (regex) |
| `src/filters/http-exception.filter.ts` | Ne leak pas les stack traces en production |

### Frontend (`Admin-web/`)

| Fichier | Rôle |
|---------|------|
| `src/config/env.ts` | Validation VITE_API_URL au démarrage |
| `src/services/api.ts` | Token en mémoire (_authToken), interceptor 401 |
| `src/services/auth.service.ts` | withCredentials sur login/register/refresh/logout |
| `src/components/AuthProvider.tsx` | Silent refresh au mount, gestion état auth |
| `src/contexts/AuthContext.ts` | Interface sans token exposé |
| `src/components/ProtectedRoute.tsx` | Redirection si non authentifié |
| `src/pages/LoginPage.tsx` | maxLength + autoComplete sur les inputs |

---

## Schéma de stockage

```
┌─────────────────────────────────────────────────┐
│                  NAVIGATEUR                     │
│                                                 │
│  ┌──────────────────────┐  ┌─────────────────┐ │
│  │   Mémoire JS         │  │  Cookie Store   │ │
│  │                      │  │                 │ │
│  │  _authToken (module) │  │  refresh_token  │ │
│  │  user (React state)  │  │  ─ httpOnly     │ │
│  │                      │  │  ─ sameSite     │ │
│  │  Perdu au refresh ↻  │  │  ─ path=/auth/  │ │
│  │  Restauré via cookie │  │    refresh      │ │
│  │                      │  │  ─ 7j TTL       │ │
│  └──────────────────────┘  └─────────────────┘ │
│                                                 │
│  localStorage: VIDE (aucun token, aucun user)   │
│                                                 │
└─────────────────────────────────────────────────┘
```
