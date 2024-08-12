import { CodeBlock } from "@/components/CodeBlock";
import { RequestBlock } from "@/components/RequestBlock";
import { BIBLE_BOOKS } from "@/constants/books";
import { TRANSLATIONS } from "@/constants/translations";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-black text-neutral-200">
      <h1 className="text-3xl font-semibold">Bible Api</h1>

      <div className="p-6 rounded shadow bg-neutral-900 flex flex-col gap-4 mt-6">
        <h2 className="font-semibold text-lg">
          Heads Up!
        </h2>
        <p>
          Every request comes with the response below and the following keys:
        </p>
        <div className="apply-code flex flex-col gap-1">
        <p>
          1. <code>status</code> (type number): the status code of the request.<br />
          1. <code>data</code> (type any | synamic): the response data. <br />
        </p>
          <ul>
          if <code>status</code> is a success number: <li><code>data</code> is an object</li>
          </ul>
          <ul>
          if <code>status</code> is an error number: <li><code>data</code> is a string (the error message)</li>
          </ul>
        </div>
        
        <h3 className="font-[500] text-neutral-300">Example Response</h3>
        <CodeBlock
          text={`{
  "status": number,
  "data": any,
  }
`}
        />
      </div>

      <div className="p-6 rounded shadow bg-neutral-900 flex flex-col gap-4 mt-6">
        <h2 className="font-semibold text-lg">
          Fetch available translations for download
        </h2>
        <h3 className="font-[500] text-neutral-300">Request</h3>
        <RequestBlock url="/api/translations" method="GET" />
        <h3 className="font-[500] text-neutral-300">Response</h3>
        <CodeBlock
          text={`{
  "status": 200,
  "data": [
    {
      "name": "American King James Version",
      "shortName": "AKJV",
      "language": "en_us",
      "size": 1842636
    },
    {
      "name": "American Standard Version",
      "shortName": "ASV",
      "language": "en_us",
      "size": 1873315
    },
]}
`}
        />
        <h3 className="font-[500] text-neutral-300">Where</h3>
        <ul className="apply-code pl-4">
          <li className="list-disc"><code>name</code> the name of translation</li>
          <li className="list-disc"><code>shortName</code> the short name of translation (used for downloading translations)</li>
          <li className="list-disc"><code>language</code> the language of translation (mostly english)</li>
          <li className="list-disc"><code>size</code> the download size of translation (in bytes)</li>
        </ul>
      </div>

      <div className="p-6 rounded shadow bg-neutral-900 flex flex-col gap-4 mt-6">
        <h2 className="font-semibold text-lg">
          Download a Translation
        </h2>
        <h3 className="font-[500] text-neutral-300">Request</h3>
        <RequestBlock url="/files/translations/{shortName}.zip" method="GET" />
        <p className="apply-code">
          where <code>shortName</code> is the translation shortName
        </p>
        <h3 className="font-[500] text-neutral-300">Response & Process</h3>
        <ul className="apply-code pl-4">
          <li className="list-disc">a zip file is downloaded on response containing 1190 files <br />
          <code>1189</code> are the different chapters of different books
          <code>the last 1</code> is the <code>books.json</code> file that contains the info on the books in this zip file
          </li>
        </ul>
        <p className="font-[500] text-sm apply-code">sample <code>books.json</code> file </p>
        <CodeBlock language="json" text={`{
  "name": "American King James",
  "shortName": "AKJV",
  "language": "en_us",
  "bookNames": [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua",
    "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
    "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
    "Psalms", "Proverbs", "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah",
    "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
    "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
    "John", "The Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
    "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter",
    "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
  ],
  "bookShortNames": [
    "Gen.", "Ex.", "Lev.", "Num.", "Deut.", "Josh.",
    "Judg.", "Ruth", "1 Sam.", "2 Sam.", "1 Kings", "2 Kings",
    "1 Chron.", "2 Chron.", "Ezra", "Neh.", "Est.", "Job",
    "Ps.", "Prov", "Eccles.", "Song", "Isa.", "Jer.",
    "Lam.", "Ezek.", "Dan.", "Hos.", "Joel", "Amos",
    "Obad.", "Jonah", "Mic.", "Nah.", "Hab.", "Zeph.",
    "Hag.", "Zech.", "Mal.", "Matt.", "Mark", "Luke",
    "John", "Acts", "Rom.", "1 Cor.", "2 Cor.", "Gal.",
    "Eph.", "Phil.", "Col.", "1 Thess.", "2 Thess.", "1 Tim.",
    "2 Tim.", "Titus", "Philem.", "Heb.", "James", "1 Pet.",
    "2 Pet.", "1 John", "2 John", "3 John", "Jude", "Rev"
  ]
}`} />


<h3 className="font-[500] text-neutral-300">Files naming convention</h3>
        <ul className="apply-code pl-4">
          <li className="list-disc">every file is named in this order <code>(bookIndex)-(chapterIndex).json</code></li>
          <li className="list-disc">therefore Genisis chp. 2 is <code>0-1.json</code></li>
          <li className="list-disc">and Matthew chp. 5 is <code>39-4.json</code></li>
        </ul>
      </div>

      
      <div className="p-6 rounded shadow bg-neutral-900 flex flex-col gap-4 mt-6">
        <h2 className="font-semibold text-lg">
          Array of Bible books in details
        </h2>
        <Suspense>
        <CodeBlock
          text={JSON.stringify(BIBLE_BOOKS)}
          language="json"
        />
        </Suspense>
      </div>
    </main>
  );
}
