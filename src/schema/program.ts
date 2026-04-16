export const programSchema = `
CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  play_cost INTEGER NOT NULL CHECK (play_cost > 0),
  color TEXT NOT NULL,
  bit_effect TEXT
);

CREATE TABLE IF NOT EXISTS program_effects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS program_effect_triggers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  effect_id INTEGER NOT NULL,
  trigger TEXT NOT NULL,
  available TEXT,
  FOREIGN KEY (effect_id) REFERENCES program_effects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS program_traits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  trait TEXT NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS program_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);
`;
