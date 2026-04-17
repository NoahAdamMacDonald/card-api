# Card-API

A REST API for managing **Beasts**, **Programs**, **Biomes **and **Relics** for a 
Deck Building Card Game.

Built using **BUN ** + **Hono**+ **SQLite**

## Group Members
_Adam Johnston_ - _Matthew Hatcher_ - _Noah MacDonald_ - _Silas Mahoney_

## Navigation
- [Project Overview](#project-overview)
- [API Concept & Resources](#api-concept-resources)
- [Database Design](#database-design)
    - [beast](#beast)
    - [biome](#biome)
    - [program](#program)
    - [relic](#relic)
- [Set up and installation](#set-up-installation-for-local-use)
- [API Endpoints](#api-endpoints)
    - [Create](#create)
    - [Read](#read)
    - [Update](#update)
    - [Delete](#delete)

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
- [x] Filter, pagination and field selection

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

<details>
<summary>types</summary>
<p>beast</p>
<p>biome</p>
<p>program</p>
<p>relic</p>
</details>


## CRUD
### Create
For creating cards, we support POST `/api/<type>`
All types have required fields and validation for their fields.

Required for all are `stats` where all other fields are put under
```json
{
  "stats": {}
}
```

#### beast
| field | Required | Validation |
| :--- | :--- | :--- |
| name | Yes | string |
| playCost | Yes | number >= 0 |
| level | Yes | number >=0 |
| evoColor | Yes | string |
| evoCost | Yes | number >= 0 |
| bts | no | number >= 0 |
| traits | no | array of strings |
| keywords | no | array of strings |
| restrictions | no | array of strings |
| effects | no | array of objects `{ text: "string", trigger: string[] }` |
| soulEffects | no | array of objects `{ trigger: string, available: string, text: string }` |
| special | no | nullable object `{ name: string, text: string }` |

**POST** `/api/beast`

```json
{
  "stats": {
    "name": "Cyber Wolf",
    "playCost": 5,
    "level": 2,
    "bts": 3,
    "evoCost": 4,
    "evoColor": "blue",
    "traits": [
      "Beast",
      "Cyber"
    ],
    "keywords": [
      "Fast",
      "Hunter"
    ],
    "restrictions": [
      "Cannot attack this turn"
    ],
    "effects": [
      {
        "text": "Gain +2 BTS this turn.",
        "trigger": [
          "On Play"
        ]
      },
      {
        "text": "Draw 1 card.",
        "trigger": [
          "All Turns"
        ]
      }
    ],
    "soulEffects": [
      {
        "trigger": "On Delete",
        "available": "Always",
        "text": "Draw 2 cards."
      },
      {
        "trigger": "On Play",
        "available": "Turn Start",
        "text": "Gain 1 energy."
      }
    ],
    "special": {
      "name": "Overclock",
      "text": "This beast gains +1 level while attacking."
    }
  }
}
```

#### biome
| field | Required | Validation |
| :--- | :--- | :--- |
| name | Yes | string |
| playCost | Yes | number >= 0 |
| color | Yes | string |
| bitEffect | Yes | string |
| effects | no | array of objects `{ text: "string", trigger: string[], available?: string }` |
| traits | no | array of strings |
| keywords | no | array of strings |

**POST** `/api/biome`

```json
{
  "stats": {
    "name": "Crystal Forest",
    "playCost": 3,
    "color": "green",
    "bitEffect": "All beasts gain +1 BTS while in this biome.",
    "effects": [
      {
        "text": "When a beast enters this biome, draw 1 card.",
        "trigger": [
          "On Enter"
        ],
        "available": "Always"
      },
      {
        "text": "Beasts with level 3 or higher gain +1 attack.",
        "trigger": [
          "All Turns"
        ]
      }
    ],
    "traits": [
      "Forest",
      "Crystal"
    ],
    "keywords": [
      "Defensive",
      "Nature"
    ]
  }
}
```

#### program
| field | Required | Validation |
| :--- | :--- | :--- |
| name | Yes | string |
| playCost | Yes | number >= 0 |
| color | Yes | string |
| bitEffect | Yes | string |
| effects | no | array of objects `{ text: "string", trigger: string[], available?: string }` |
| traits | no | array of strings |
| keyword| field | Required | Validation |

**POST** `/api/program`

```json
{
  "stats": {
    "name": "Data Surge",
    "playCost": 2,
    "color": "blue",
    "bitEffect": "Gain 1 extra action this turn.",
    "effects": [
      {
        "text": "Draw 2 cards.",
        "trigger": [
          "On Play"
        ]
      },
      {
        "text": "If you have 3+ programs in play, gain +1 energy.",
        "trigger": [
          "Conditional"
        ],
        "available": "Turn Start"
      }
    ],
    "traits": [
      "Utility",
      "Data"
    ],
    "keywords": [
      "Instant",
      "Support"
    ]
  }
}
```

#### relic
| field | Required | Validation |
| :--- | :--- | :--- |
| name | Yes | string |
| playCost | Yes | number >= 0 |
| color | Yes | string |
| bitEffect | Yes | string |
| effects | no | array of objects `{ text: "string", trigger: string[], available?: string }` |
| keywords | no | array of strings |

**POST** `/api/relic`

```json
{
  "stats": {
    "name": "Ancient Core",
    "playCost": 4,
    "color": "red",
    "bitEffect": "Your beasts gain +1 attack while this relic is active.",
    "effects": [
      {
        "text": "When this relic is played, heal 2 damage from any beast.",
        "trigger": [
          "On Play"
        ]
      },
      {
        "text": "At the start of your turn, gain 1 energy.",
        "trigger": [
          "Turn Start"
        ],
        "available": "Always"
      }
    ],
    "keywords": [
      "Artifact",
      "Energy"
    ]
  }
}
```

### READ
All endpoints support `GET` to retrieve an array of all cards of its type and a `GET/:id`

#### GET
Returns an array of all cards of its type
**GET** `/api/<type>?[param=value]`

All endpoints supports parameters
- page : limits page
- limit : limits number of results
- name : filters by name
- minId : filters by minimum id
- maxId : filters by maximum id
- order : change order by id from ASC or DESC

beast supports
- evoColor : filters id to only with matching evoColor
- minLevel : filters by minimum level
- maxLevel : filters by maximum level

biome, program and relic support
- color : filters by color

`/api/beast`

```json
{
  "page": 1,
  "limit": 20,
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "5"
    },
    {
      "id": 2,
      "name": "test"
    },
    {
      "id": 3,
      "name": "test"
    },
    {
      "id": 4,
      "name": "abc"
    },
    {
      "id": 5,
      "name": "Cyber Wolf"
    },
    {
      "id": 6,
      "name": "Cyber Wolf"
    },
    {
      "id": 7,
      "name": "Cyber Wolf"
    },
    {
      "id": 8,
      "name": "Bad Beast"
    },
    {
      "id": 9,
      "name": "abc"
    },
    {
      "id": 10,
      "name": "Cyber Wolf"
    }
  ]
}
```

`/api/beast?limit=3&evoColor=blue&order=desc`
```json
{
  "page": 1,
  "limit": 3,
  "count": 3,
  "results": [
    {
      "id": 10,
      "name": "Cyber Wolf"
    },
    {
      "id": 9,
      "name": "abc"
    },
    {
      "id": 2,
      "name": "test"
    }
  ]
}
```

#### GET/:id
Returns all details for a single card with an optional fields parameter to limit results
**GET** `/api/<type>/:id?fields=<field>,<field>`

Fields: if applied, stats only returns fields listed.

`/api/10`

```json
{
  "id": 10,
  "cardType": "beast",
  "stats": {
    "name": "Cyber Wolf",
    "playCost": 5,
    "level": 2,
    "BTS": 3,
    "evoCost": 4,
    "evoColor": "blue",
    "effects": [
      {
        "trigger": [
          "On Play"
        ],
        "text": "Gain +2 BTS this turn."
      },
      {
        "trigger": [
          "All Turns"
        ],
        "text": "Draw 1 card."
      }
    ],
    "special": {
      "name": "Overclock",
      "text": "This beast gains +1 level while attacking."
    },
    "soulEffects": [
      {
        "trigger": "On Delete",
        "available": "Always",
        "text": "Draw 2 cards."
      },
      {
        "trigger": "On Play",
        "available": "Turn Start",
        "text": "Gain 1 energy."
      }
    ],
    "restrictions": [
      "Cannot attack this turn"
    ],
    "traits": [
      "Beast",
      "Cyber"
    ],
    "keywords": [
      "Fast",
      "Hunter"
    ]
  }
}
```

`/api/beast/10?fields=name,level,effects`

```json
{
  "id": 10,
  "cardType": "beast",
  "stats": {
    "name": "Cyber Wolf",
    "level": 2,
    "effects": [
      {
        "trigger": [
          "On Play"
        ],
        "text": "Gain +2 BTS this turn."
      },
      {
        "trigger": [
          "All Turns"
        ],
        "text": "Draw 1 card."
      }
    ]
  }
}
```

### Update
all endpoints support **PATCH** to update individual fields and **PUT** to replace entire object.

**PATCH** `/api/<type>/:id`

```json
{
    "stats": {
        "name": "new name"
    }
}
```

Success
```json
{
    "message": "Successfully updated Beast",
    "success": true,
    "updatedFields": [
        "stats.name"
    ]
}
```

Fail
```json
{
    "errors": [
        {
            "type": "Invalid Value",
            "fields": [
                {
                    "field": "name",
                    "value": "1",
                    "reason": "must be a string"
                }
            ]
        }
    ],
    "success": false
}
```

- - - -

**PUT** `/api/<type>/:id`

```json
{
    "stats": {
        "name": "replaced card",
        "playCost": 5,
        "level": 1,
        "bts": 1,
        "evoCost": 10,
        "evoColor": "green"
    }
}
```

Success
```
{
    "message": "Successfully replaced Beast",
    "success": true
}
```

Fail
```json
{
    "errors": [
        {
            "type": "missing required fields",
            "fields": [
                "bts",
                "evoCost"
            ]
        }
    ],
    "success": false
}
```

### DELETE
all endpoints support **DELETE** cards.

**DELETE** `/api/<type>/:id`

Success
```json
{
  "message": "Successfully deleted Beast",
  "success": true
}
```

Fail
```json
{
  "error": "Beast not found",
  "success": false
}
```





