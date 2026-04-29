import { NextRequest } from "next/server";
import { AppResponse } from "@/utils/response";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(process.cwd());
const MIN_FILE = join(ROOT, "public", "files", "bundled", "bible-all.min.json");
const FULL_FILE = join(ROOT, "public", "files", "bundled", "bible-all.json");

const PRIORITY_TRANSLATIONS = ["KJV", "NKJV", "NLT", "AMP"];

type BibleBundle = {
  translations: { shortName: string; name: string; language: string }[];
  translationsData: Record<string, [number, number, number, string][]>;
};

type SearchResult = {
  indices: [number, number, number];
  text: string;
  translation: string;
  score: number;
};

let minCache: BibleBundle | null = null;
let fullCache: BibleBundle | null = null;

function loadBundle(deep: boolean): BibleBundle {
  if (deep) {
    if (!fullCache) {
      fullCache = JSON.parse(readFileSync(FULL_FILE, "utf-8"));
    }
    return fullCache as BibleBundle;
  }
  if (!minCache) {
    minCache = JSON.parse(readFileSync(MIN_FILE, "utf-8"));
  }
  return minCache as BibleBundle;
}

function buildTranslationOrder(bundle: BibleBundle): string[] {
  const available = new Set(bundle.translations.map((t) => t.shortName));
  const ordered: string[] = [];

  for (const name of PRIORITY_TRANSLATIONS) {
    if (available.has(name)) {
      ordered.push(name);
    }
  }

  for (const t of bundle.translations) {
    if (!ordered.includes(t.shortName)) {
      ordered.push(t.shortName);
    }
  }

  return ordered;
}

function getTranslationPriorityRank(ordered: string[]): Record<string, number> {
  const rank: Record<string, number> = {};
  for (let i = 0; i < ordered.length; i++) {
    rank[ordered[i]] = i;
  }
  return rank;
}

function searchVerses(
  bundle: BibleBundle,
  keywords: string[],
  limit: number,
  translationFilter?: string,
): Omit<SearchResult, "score">[] {
  const ordered = buildTranslationOrder(bundle);
  const priorityRank = getTranslationPriorityRank(ordered);

  const seen = new Map<
    string,
    { bestPos: number; text: string; translation: string; indices: [number, number, number]; rank: number }
  >();

  for (const shortName of ordered) {
    const verses = bundle.translationsData[shortName];
    if (!verses) continue;

    const rank = priorityRank[shortName];

    for (let i = 0; i < verses.length; i++) {
      const [bookIdx, chapterIdx, verseIdx, text] = verses[i];
      const lowerText = text.toLowerCase();

      let bestPos = Infinity;
      let allMatch = true;

      for (const kw of keywords) {
        const pos = lowerText.indexOf(kw);
        if (pos === -1) {
          allMatch = false;
          break;
        }
        if (pos < bestPos) bestPos = pos;
      }

      if (!allMatch) continue;

      const key = `${bookIdx}-${chapterIdx}-${verseIdx}`;
      const existing = seen.get(key);

      if (!existing || rank < existing.rank || (rank === existing.rank && bestPos < existing.bestPos)) {
        seen.set(key, {
          bestPos,
          text,
          translation: shortName,
          indices: [bookIdx, chapterIdx, verseIdx],
          rank,
        });
      }
    }
  }

  const scored: SearchResult[] = [];
  for (const { bestPos, text, translation, indices } of Array.from(seen.values())) {
    let finalText = text;
    let finalTranslation = translation;

    if (translationFilter && bundle.translationsData[translationFilter]) {
      const filteredVerses = bundle.translationsData[translationFilter];
      const [bookIdx, chapterIdx, verseIdx] = indices;
      const filteredVerse = filteredVerses.find(
        (v) => v[0] === bookIdx && v[1] === chapterIdx && v[2] === verseIdx,
      );
      if (filteredVerse) {
        finalText = filteredVerse[3];
        finalTranslation = translationFilter;
      }
    }

    scored.push({ indices, text: finalText, translation: finalTranslation, score: keywords.length + 1 / (bestPos + 1) });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ indices, text, translation }) => ({
    indices,
    text,
    translation,
  }));
}

export function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q");
    const deep = url.searchParams.get("deep") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    if (!q || q.trim().length === 0) {
      return AppResponse.error("Query parameter 'q' is required", 400);
    }

    const keywords = q
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((kw) => kw.length > 0);

    if (keywords.length === 0) {
      return AppResponse.error("Query parameter 'q' is required", 400);
    }

    const translation = url.searchParams.get("translation");

    const bundle = loadBundle(deep);
    const results = searchVerses(bundle, keywords, Math.min(limit, 100), translation || undefined);

    return AppResponse.success(results);
  } catch (error) {
    return AppResponse.error("Internal server error", 500);
  }
}
