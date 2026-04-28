# Bizina API

API de gestion commerciale : produits, achats, ventes, stock, paiements.

**Stack** : NestJS 11 · TypeORM · MySQL · JWT · Swagger · SWC

---

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Lancer le projet](#lancer-le-projet)
- [Documentation Swagger](#documentation-swagger)
- [Scripts disponibles](#scripts-disponibles)
- [API Endpoints](#api-endpoints)
  - [Auth](#1-auth--auth)
  - [Users](#2-users--users)
  - [Customers](#3-customers--customers)
  - [Suppliers](#4-suppliers--suppliers)
  - [Units](#5-units--units)
  - [Products](#6-products--products)
  - [Product Units](#7-product-units--product-units)
  - [Payment Methods](#8-payment-methods--payment-methods)
  - [Purchases](#9-purchases--purchases)
  - [Purchase Items](#10-purchase-items--purchase-items)
  - [Sales](#11-sales--sales)
  - [Sale Items](#12-sale-items--sale-items)
  - [Sale Payments](#13-sale-payments--sale-payments)
  - [Stock Movements](#14-stock-movements--stock-movements)

---

## Prérequis

| Outil   | Version minimale       |
| ------- | ---------------------- |
| Node.js | >= 18 (testé avec v24) |
| npm     | >= 9                   |
| MySQL   | >= 8.0                 |
| Git     | >= 2.x                 |

---

## Installation

```bash
# 1. Cloner le projet
git clone <url-du-repo> bizina
cd bizina

# 2. Installer les dépendances
npm install
```

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
NODE_ENV=development
PORT=3000

DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASS=your_password
DATABASE_NAME=bizina

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

---

## Base de données

```bash
# Créer la base de données MySQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bizina;"

# Exécuter les migrations
npm run migration:run

# (Optionnel) Remplir la base avec des données de test
npm run db:seed
```

Le seeder crée : 8 unités, 3 utilisateurs (admin/manager/caissier), 5 clients, 4 fournisseurs, 5 modes de paiement, 8 produits et 14 associations produit-unité.

---

## Lancer le projet

```bash
# Mode développement (hot reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API démarre par défaut sur `http://localhost:3000`.

---

## Documentation Swagger

Une fois le serveur lancé, accéder à la documentation interactive :

```
http://localhost:3000/docs
```

---

## Scripts disponibles

| Script                                           | Description                                  |
| ------------------------------------------------ | -------------------------------------------- |
| `npm run start:dev`                              | Lancer en mode développement avec hot reload |
| `npm run build`                                  | Compiler le projet                           |
| `npm run start:prod`                             | Lancer en mode production                    |
| `npm run lint`                                   | Linter le code                               |
| `npm run format`                                 | Formatter le code avec Prettier              |
| `npm run test`                                   | Exécuter les tests unitaires                 |
| `npm run test:e2e`                               | Exécuter les tests end-to-end                |
| `npm run migration:run`                          | Appliquer les migrations                     |
| `npm run migration:revert`                       | Annuler la dernière migration                |
| `npm run migration:generate --name=NomMigration` | Générer une migration                        |
| `npm run db:seed`                                | Remplir la base avec des données de test     |

---

## API Endpoints

### Authentification

Toutes les routes protégées nécessitent le header :

```
Authorization: Bearer <token>
```

Le token est obtenu via `POST /auth/login`.

---

### 1. Auth (`/auth`)

| Méthode | Route            | Auth | Description                      |
| ------- | ---------------- | ---- | -------------------------------- |
| POST    | `/auth/register` | Non  | Inscription                      |
| POST    | `/auth/login`    | Non  | Connexion                        |
| GET     | `/auth/profile`  | Oui  | Profil de l'utilisateur connecté |

**RegisterDto :**

```json
{
  "username": "string (requis)",
  "email": "string (optionnel, format email)",
  "password": "string (requis)"
}
```

**SignInDto :**

```json
{
  "username": "string (requis)",
  "password": "string (requis)"
}
```

---

### 2. Users (`/users`)

| Méthode | Route        | Auth | Description              |
| ------- | ------------ | ---- | ------------------------ |
| POST    | `/users`     | Non  | Créer un utilisateur     |
| GET     | `/users`     | Oui  | Lister les utilisateurs  |
| GET     | `/users/:id` | Oui  | Détail d'un utilisateur  |
| PATCH   | `/users/:id` | Oui  | Modifier un utilisateur  |
| DELETE  | `/users/:id` | Oui  | Supprimer un utilisateur |

**CreateUserDto :**

```json
{
  "username": "string (requis)",
  "email": "string (optionnel, format email)",
  "password": "string (requis)",
  "role": "UserRole (optionnel)"
}
```

---

### 3. Customers (`/customers`)

| Méthode | Route            | Auth | Description         |
| ------- | ---------------- | ---- | ------------------- |
| POST    | `/customers`     | Oui  | Créer un client     |
| GET     | `/customers`     | Oui  | Lister les clients  |
| GET     | `/customers/:id` | Oui  | Détail d'un client  |
| PATCH   | `/customers/:id` | Oui  | Modifier un client  |
| DELETE  | `/customers/:id` | Oui  | Supprimer un client |

**CreateCustomerDto :**

```json
{
  "name": "string (2-150 chars, requis)",
  "phone": "string (max 30 chars, optionnel)",
  "address": "string (max 2000 chars, optionnel)"
}
```

---

### 4. Suppliers (`/suppliers`)

| Méthode | Route            | Auth | Description              |
| ------- | ---------------- | ---- | ------------------------ |
| POST    | `/suppliers`     | Oui  | Créer un fournisseur     |
| GET     | `/suppliers`     | Oui  | Lister les fournisseurs  |
| GET     | `/suppliers/:id` | Oui  | Détail d'un fournisseur  |
| PATCH   | `/suppliers/:id` | Oui  | Modifier un fournisseur  |
| DELETE  | `/suppliers/:id` | Oui  | Supprimer un fournisseur |

**CreateSupplierDto :**

```json
{
  "name": "string (2-150 chars, requis)",
  "phone": "string (max 30 chars, optionnel)",
  "address": "string (max 2000 chars, optionnel)"
}
```

---

### 5. Units (`/units`)

| Méthode | Route        | Auth | Description         |
| ------- | ------------ | ---- | ------------------- |
| POST    | `/units`     | Oui  | Créer une unité     |
| GET     | `/units`     | Oui  | Lister les unités   |
| GET     | `/units/:id` | Oui  | Détail d'une unité  |
| PATCH   | `/units/:id` | Oui  | Modifier une unité  |
| DELETE  | `/units/:id` | Oui  | Supprimer une unité |

**CreateUnitDto :**

```json
{
  "name": "string (max 100 chars, requis) — ex: Kilogramme",
  "symbol": "string (max 20 chars, requis) — ex: kg"
}
```

---

### 6. Products (`/products`)

| Méthode | Route                 | Auth | Description                        |
| ------- | --------------------- | ---- | ---------------------------------- |
| POST    | `/products`           | Oui  | Créer un produit                   |
| GET     | `/products`           | Oui  | Lister les produits                |
| GET     | `/products/:id`       | Oui  | Détail d'un produit                |
| GET     | `/products/:id/stock` | Oui  | Niveau de stock (en unité de base) |
| PATCH   | `/products/:id`       | Oui  | Modifier un produit                |
| DELETE  | `/products/:id`       | Oui  | Supprimer un produit               |

**CreateProductDto :**

```json
{
  "name": "string (2-150 chars, requis)",
  "description": "string (5-2000 chars, requis)",
  "baseUnitId": "UUID (requis)",
  "productUnit": [
    {
      "unitId": "UUID (requis)",
      "conversionToBase": "number (requis)"
    }
  ]
}
```

**Réponse `GET /products/:id/stock` :**

```json
{
  "productId": "uuid",
  "stockLevel": 150.5
}
```

---

### 7. Product Units (`/product-units`)

| Méthode | Route                | Auth | Description                         |
| ------- | -------------------- | ---- | ----------------------------------- |
| POST    | `/product-units`     | Oui  | Créer une association produit/unité |
| GET     | `/product-units`     | Oui  | Lister les associations             |
| GET     | `/product-units/:id` | Oui  | Détail d'une association            |
| PATCH   | `/product-units/:id` | Oui  | Modifier une association            |
| DELETE  | `/product-units/:id` | Oui  | Supprimer une association           |

**CreateProductUnitDto :**

```json
{
  "productId": "UUID (requis)",
  "unitId": "UUID (requis)",
  "conversionToBase": "number (requis)"
}
```

---

### 8. Payment Methods (`/payment-methods`)

| Méthode | Route                  | Auth | Description                   |
| ------- | ---------------------- | ---- | ----------------------------- |
| POST    | `/payment-methods`     | Oui  | Créer un mode de paiement     |
| GET     | `/payment-methods`     | Oui  | Lister les modes de paiement  |
| GET     | `/payment-methods/:id` | Oui  | Détail d'un mode de paiement  |
| PATCH   | `/payment-methods/:id` | Oui  | Modifier un mode de paiement  |
| DELETE  | `/payment-methods/:id` | Oui  | Supprimer un mode de paiement |

**CreatePaymentMethodDto :**

```json
{
  "name": "string (2-100 chars, requis) — ex: Cash, Carte, Chèque"
}
```

---

### 9. Purchases (`/purchases`)

| Méthode | Route            | Auth | Description                       |
| ------- | ---------------- | ---- | --------------------------------- |
| POST    | `/purchases`     | Oui  | Créer un achat (en-tête + lignes) |
| GET     | `/purchases`     | Oui  | Lister les achats                 |
| GET     | `/purchases/:id` | Oui  | Détail d'un achat                 |
| PATCH   | `/purchases/:id` | Oui  | Modifier un achat                 |
| DELETE  | `/purchases/:id` | Oui  | Supprimer un achat                |

**CreatePurchaseDto :**

```json
{
  "supplierId": "UUID (requis)",
  "purchaseDate": "ISO 8601 (requis)",
  "items": [
    {
      "productUnitId": "UUID (requis)",
      "quantity": "number (requis)",
      "unitPrice": "number (requis)"
    }
  ]
}
```

> Le total est calculé automatiquement côté serveur. La création d'un achat génère automatiquement les mouvements de stock (entrée).

---

### 10. Purchase Items (`/purchase-items`)

| Méthode | Route                 | Auth | Description                 |
| ------- | --------------------- | ---- | --------------------------- |
| POST    | `/purchase-items`     | Oui  | Créer une ligne d'achat     |
| GET     | `/purchase-items`     | Oui  | Lister les lignes d'achat   |
| GET     | `/purchase-items/:id` | Oui  | Détail d'une ligne d'achat  |
| DELETE  | `/purchase-items/:id` | Oui  | Supprimer une ligne d'achat |

**CreatePurchaseItemDto :**

```json
{
  "purchaseId": "UUID (requis)",
  "productUnitId": "UUID (requis)",
  "quantity": "number (requis)",
  "unitPrice": "number (requis)"
}
```

---

### 11. Sales (`/sales`)

| Méthode | Route        | Auth | Description                                    |
| ------- | ------------ | ---- | ---------------------------------------------- |
| POST    | `/sales`     | Oui  | Créer une vente                                |
| GET     | `/sales`     | Oui  | Lister les ventes                              |
| GET     | `/sales/:id` | Oui  | Détail d'une vente (inclut statut de paiement) |
| PATCH   | `/sales/:id` | Oui  | Modifier une vente                             |
| DELETE  | `/sales/:id` | Oui  | Supprimer une vente                            |

**CreateSaleDto :**

```json
{
  "customerId": "UUID (optionnel)",
  "saleDate": "ISO 8601 (requis)",
  "items": [
    {
      "productUnitId": "UUID (requis)",
      "quantity": "number (requis)",
      "unitPrice": "number (requis)"
    }
  ]
}
```

> **Logique métier :**
>
> - Le stock est vérifié avant la création (erreur 400 si stock insuffisant)
> - Les mouvements de stock (sortie) sont créés automatiquement
> - Les réponses incluent `paymentStatus` (UNPAID / PARTIAL / PAID), `paidAmount` et `remainingAmount`

---

### 12. Sale Items (`/sale-items`)

| Méthode | Route             | Auth | Description                  |
| ------- | ----------------- | ---- | ---------------------------- |
| POST    | `/sale-items`     | Oui  | Créer une ligne de vente     |
| GET     | `/sale-items`     | Oui  | Lister les lignes de vente   |
| GET     | `/sale-items/:id` | Oui  | Détail d'une ligne de vente  |
| DELETE  | `/sale-items/:id` | Oui  | Supprimer une ligne de vente |

**CreateSaleItemDto :**

```json
{
  "saleId": "UUID (requis)",
  "productUnitId": "UUID (requis)",
  "quantity": "number (requis)",
  "unitPrice": "number (requis)"
}
```

---

### 13. Sale Payments (`/sale-payments`)

| Méthode | Route                | Auth | Description             |
| ------- | -------------------- | ---- | ----------------------- |
| POST    | `/sale-payments`     | Oui  | Enregistrer un paiement |
| GET     | `/sale-payments`     | Oui  | Lister les paiements    |
| GET     | `/sale-payments/:id` | Oui  | Détail d'un paiement    |
| PATCH   | `/sale-payments/:id` | Oui  | Modifier un paiement    |
| DELETE  | `/sale-payments/:id` | Oui  | Supprimer un paiement   |

**CreateSalePaymentDto :**

```json
{
  "saleId": "UUID (requis)",
  "paymentMethodId": "UUID (requis)",
  "amount": "number (requis, > 0, <= montant restant)",
  "paymentDate": "ISO 8601 (optionnel, défaut: maintenant)"
}
```

> Le montant est validé : il doit être positif et ne pas dépasser le montant restant à payer.

---

### 14. Stock Movements (`/stock-movements`)

| Méthode | Route                  | Auth | Description                         |
| ------- | ---------------------- | ---- | ----------------------------------- |
| POST    | `/stock-movements`     | Oui  | Créer un ajustement de stock manuel |
| GET     | `/stock-movements`     | Oui  | Lister les mouvements de stock      |
| GET     | `/stock-movements/:id` | Oui  | Détail d'un mouvement               |
| DELETE  | `/stock-movements/:id` | Oui  | Supprimer un mouvement              |

**CreateStockMovementDto :**

```json
{
  "productUnitId": "UUID (requis)",
  "quantity": "number (requis — positif pour entrée, négatif pour sortie)"
}
```

> Le endpoint POST est réservé aux ajustements manuels (type ADJUSTMENT). Les mouvements liés aux achats et ventes sont créés automatiquement.
> Les quantités sont converties en unité de base via `conversionToBase`.

---

## Format de réponse

Toutes les réponses suivent un format standard via `ResponseUtil` :

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {}
}
```

---

## Relations clés

```
Products ──1:N──> ProductUnits ──N:1──> Units
                       │
         ┌─────────────┼─────────────┐
         v             v             v
   PurchaseItems   SaleItems   StockMovements
         │             │
         v             v
    Purchases       Sales ──1:N──> SalePayments
         │             │                 │
         v             v                 v
    Suppliers     Customers       PaymentMethods
```

---

## Tests

```bash
# Tests unitaires
npm run test

# Tests end-to-end
npm run test:e2e

# Couverture
npm run test:cov
```

---

## Security Notes

- Endpoints publics explicitement autorisés:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Les endpoints de gestion des utilisateurs (`/users`) sont réservés aux comptes admin.
- Ne jamais logger de secrets/tokens (`JWT`, `refresh_token`, mots de passe, cookies).
- Les variables `JWT_SECRET` et `JWT_REFRESH_SECRET` doivent être aléatoires, longues, et différentes.
