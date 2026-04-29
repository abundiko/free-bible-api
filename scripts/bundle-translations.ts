// @ts-nocheck
import { $, BunFile } from "bun";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ZIPS_DIR = join(ROOT, "public", "files", "translations");
const OUTPUT_DIR = join(ROOT, "public", "files", "bundled");
const OUTPUT_FILE = join(OUTPUT_DIR, "bible-all.json");
const TEMP_DIR = join(ROOT, "tmp", "extract");

type VerseEntry = [
  bookIndex: number,
  chapterIndex: number,
  verseIndex: number,
  text: string,
];
type TranslationIndex = {
  shortName: string;
  name: string;
  language: string;
};

type BibleBundle = {
  translations: TranslationIndex[];
  translationsData: Record<string, VerseEntry[]>;
};

async function extractZip(zipPath: string, destDir: string) {
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });
  await $`unzip -o ${zipPath} -d ${destDir}`.quiet();
}

function getChapterFiles(extractDir: string): string[] {
  const entries = readdirSync(extractDir);
  return entries.filter((f) => /^\d+-\d+\.json$/.test(f)).sort();
}

function parseChapterFile(
  filePath: string,
  bookIndex: number,
  chapterIndex: number,
): VerseEntry[] {
  const content = JSON.parse(readFileSync(filePath, "utf-8"));
  const verses: string[] = content.verses;
  if (!Array.isArray(verses)) return [];

  return verses.map((text, verseIndex) => [
    bookIndex,
    chapterIndex,
    verseIndex,
    text,
  ]);
}

function parseBooksJson(extractDir: string) {
  const booksPath = join(extractDir, "books.json");
  if (!existsSync(booksPath)) return null;
  return JSON.parse(readFileSync(booksPath, "utf-8"));
}

async function main() {
  console.log("📦 Bundling Bible translations...");

  const zipFiles = readdirSync(ZIPS_DIR).filter((f) => f.endsWith(".zip"));
  console.log(`Found ${zipFiles.length} translation zip files`);

  const bundle: BibleBundle = {
    translations: [],
    translationsData: {},
  };

  for (const zipFile of zipFiles) {
    const shortName = zipFile.replace(".zip", "");
    const zipPath = join(ZIPS_DIR, zipFile);
    const extractDir = join(TEMP_DIR, shortName);

    console.log(`\n📖 Processing: ${shortName}`);

    await extractZip(zipPath, extractDir);

    const booksMeta = parseBooksJson(extractDir);
    if (!booksMeta) {
      console.warn(`  ⚠️  No books.json found for ${shortName}, skipping`);
      continue;
    }

    const chapterFiles = getChapterFiles(extractDir);
    console.log(`  📄 Found ${chapterFiles.length} chapter files`);

    const allVerses: VerseEntry[] = [];
    const bookChapterIndex: Record<string, number> = {};

    for (const file of chapterFiles) {
      const [bookStr, chapterStr] = file.replace(".json", "").split("-");
      const bookIndex = parseInt(bookStr, 10);
      const chapterIndex = parseInt(chapterStr, 10);

      const filePath = join(extractDir, file);
      const verses = parseChapterFile(filePath, bookIndex, chapterIndex);
      allVerses.push(...verses);
    }

    bundle.translationsData[shortName] = allVerses;
    bundle.translations.push({
      shortName,
      name: booksMeta.name || shortName,
      language: booksMeta.language || "en_us",
    });

    console.log(`  ✅ Indexed ${allVerses.length.toLocaleString()} verses`);

    rmSync(extractDir, { recursive: true, force: true });
  }

  console.log("\n💾 Writing bundled file...");
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(bundle, null, 2));

  const stats = statSync(OUTPUT_FILE);
  console.log(`📊 Output: ${OUTPUT_FILE}`);
  console.log(`📏 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📚 Translations: ${bundle.translations.length}`);
  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
