import { readFileSync } from "fs";
import { join } from "path";

//Add seeded data to /data/seed/<type>.json

//Start server with bun run src/server.ts

//In seperate terminal
//Run with single flag with bun run index.ts --<type>
//Run with multiple flags with bun run index.ts --beast --biome
//Run all with bun run index.ts


//Change this to your server URL if needed
const baseUrl = "http://localhost:3000/api/";

const args = process.argv.slice(2);
const flags = new Set(args);

const seedTargets = [
	{ flag: "--beast", type: "beast", file: "beast.json" },
	{ flag: "--biome", type: "biome", file: "biome.json" },
	{ flag: "--program", type: "program", file: "program.json" },
	{ flag: "--relic", type: "relic", file: "relic.json" },
];

async function seed(type: string, file: string) {
	const filePath = join("./data/seed", file);
	const raw = readFileSync(filePath, "utf8");
	const items = JSON.parse(raw);

	console.log(`\nSeeding ${type} (${items.length} items)...`);

	for (const stats of items) {
		const body = { stats };

		const res = await fetch(baseUrl + type, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const json = await res.json();

		if (!res.ok) {
			console.error(`❌ Failed to seed ${type}:`, json);
		} else {
			console.log(`✔ Seeded ${type}: ${stats.name}`);
		}
	}
}

async function main() {
	const runAll = flags.size === 0;

	for (const target of seedTargets) {
		if (runAll || flags.has(target.flag)) {
			await seed(target.type, target.file);
		}
	}

	console.log("\n🌱 Seeding complete!");
}

main();
