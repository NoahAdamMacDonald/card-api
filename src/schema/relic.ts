export const relicSchema = `
CREATE TABLE IF NOT EXISTS relics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  play_cost INTEGER NOT NULL CHECK (play_cost >= 0),
  color TEXT NOT NULL,
  bit_effect TEXT
);

CREATE TABLE IF NOT EXISTS relic_effects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relic_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (relic_id) REFERENCES relics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relic_effect_triggers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  effect_id INTEGER NOT NULL,
  trigger TEXT NOT NULL,
  available TEXT,
  FOREIGN KEY (effect_id) REFERENCES relic_effects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relic_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relic_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  FOREIGN KEY (relic_id) REFERENCES relics(id) ON DELETE CASCADE
);
`;
