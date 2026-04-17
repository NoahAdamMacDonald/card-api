# Card-API

A REST API for managing **Beasts**, **Programs**, **Biomes **and **Relics** for a 
Deck Building Card Game.

Built using **BUN ** + **Hono**+ **SQLite**

## Group Members
_Adam Johnston_ - _Matthew Hatcher_ - _Noah MacDonald_ - _Silas Mahoney_

## Navigation


## Project Overview
This project is a full REST API built that exposes

- Beasts
- Biomes
- Programs
- Relics

1. The API supports full CRUD operations
    1. POST
    2. GET
    3. PATCH / PUT
    4. DELETE
2. structured validation
3. and consistent error messages.

All available endpoints can be found listed at
```http
https://card-api.fly.dev/
```
or if run locally the root url

## API Concept & Resources
The domain of this API is a for a deck building card game where each resource
represents a type of card in the game

| Resource |
| :--- |
| Beast |
| Biome |
| Program |
| Relic |

## Database Design
SQLite is used as the database engine.
Requirements Statisifed
Tables for all core resources
- [x] Primary Keys id `INTEGER PRIMARY KEY AUTOINCREMENT`
- [x] Constraints (`NOT NULL`, `CHECK` constraints, foreign keys)
- [x] Seed data included
- [x] Data integrity enforced

### Example Schema
#### Beast

```sql
CREATE TABLE IF NOT EXISTS beasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  play_cost INTEGER NOT NULL CHECK (play_cost >= 0),
  level INTEGER NOT NULL CHECK (level >= 0),
  bts INTEGER NOT NULL CHECK (bts >= 0),
  evo_cost INTEGER NOT NULL CHECK (evo_cost >= 0),
  evo_color TEXT NOT NULL
);
```
#### Biome

```sql
CREATE TABLE IF NOT EXISTS biomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  play_cost INTEGER NOT NULL CHECK (play_cost >= 0),
  color TEXT NOT NULL,
  bit_effect TEXT
);
```

#### Program

```sql
CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  play_cost INTEGER NOT NULL CHECK (play_cost >= 0),
  color TEXT NOT NULL,
  bit_effect TEXT
);
```

#### Relic

```sql
CREATE TABLE IF NOT EXISTS relics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  play_cost INTEGER NOT NULL CHECK (play_cost >= 0),
  color TEXT NOT NULL,
  bit_effect TEXT
);
```

## Set up & Installation for local use

1. Clone the repository

```bash
git clone https://github.com/NoahAdamMacDonald/card-api.git
cd card-api
```

2. install bun

[bun install page](https://bun.com/docs/installation)

Verify
```bash
bun --version
```

3. Install dependencies
```bash
bun install
```

4. Run Server

```bash
bun run src/server.ts
```

by default uses `localhost:3000`


## API Endpoints

All APIs follow the structure of

```plaintext
GET    /api/<type>
POST   /api/<type>
GET    /api/<type>/:id
PATCH  /api/<type>/:id
PUT    /api/<type>/:id
DELETE /api/<type>/:id
```

### API Types







