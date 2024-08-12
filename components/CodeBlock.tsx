"use client";

import { CopyBlock, dracula } from "react-code-blocks";

export type CodeBlockProps = {
  text: string;
  language?: string;
};

export function CodeBlock({ text, language = "js" }: CodeBlockProps) {
  return (
    <CopyBlock
      wrapLongLines
      codeBlock
      text={text}
      language={language}
      showLineNumbers={false}
      theme={dracula}
    />
  );
}
