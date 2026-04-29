// @ts-nocheck
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const INPUT_FILE = join(ROOT, "public", "files", "bundled", "bible-all.json");
const OUTPUT_DIR = join(ROOT, "public", "files", "bundled");

const DEFAULT_TRANSLATIONS = ["KJV", "NIV", "AMP"];

function getRequestedTranslations(): string[] {
  const args = process.argv.slice(2);
  if (args.length > 0) return args;

  const env = process.env.BIBLE_TRANSLATIONS;
  if (env) return env.split(",").map((s) => s.trim());

  return DEFAULT_TRANSLATIONS;
}

function main() {
  const requested = getRequestedTranslations();
  console.log(`📦 Creating minified bundle for: ${requested.join(", ")}`);

  console.log(`📖 Reading ${INPUT_FILE}...`);
  const full = JSON.parse(readFileSync(INPUT_FILE, "utf-8"));

  const available = new Set(
    full.translations.map((t: { shortName: string }) => t.shortName),
  );
  const missing = requested.filter((s) => !available.has(s));
  if (missing.length > 0) {
    console.error(`❌ Unknown translations: ${missing.join(", ")}`);
    // @ts-ignore
    console.error(`   Available: ${[...available].join(", ")}`);
    process.exit(1);
  }

  const filteredTranslations = full.translations.filter(
    (t: { shortName: string }) => requested.includes(t.shortName),
  );

  const filteredData: Record<string, unknown[]> = {};
  for (const shortName of requested) {
    filteredData[shortName] = full.translationsData[shortName];
  }

  const bundle = {
    translations: filteredTranslations,
    translationsData: filteredData,
  };

  const outputFile = join(OUTPUT_DIR, "bible-all.min.json");

  console.log(`💾 Writing minified file...`);
  writeFileSync(outputFile, JSON.stringify(bundle));

  const stats = statSync(outputFile);
  console.log(`📊 Output: ${outputFile}`);
  console.log(`📏 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📚 Translations: ${bundle.translations.length}`);
  console.log(
    `📝 Total verses: ${Object.values(bundle.translationsData)
      .reduce((sum, v) => sum + (v as unknown[]).length, 0)
      .toLocaleString()}`,
  );
  console.log("\n✅ Done!");
}

try {
  main();
} catch (err) {
  console.error("❌ Error:", err);
  process.exit(1);
}
