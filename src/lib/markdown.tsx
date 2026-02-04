import React from "react";

/**
 * Parses inline markdown formatting (bold, italic) and returns React elements
 */
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text** or __text__
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/s);
    const boldAltMatch = remaining.match(/^(.*?)__(.+?)__/s);
    
    const match = boldMatch && (!boldAltMatch || boldMatch.index! <= boldAltMatch.index!) 
      ? boldMatch 
      : boldAltMatch;

    if (match) {
      if (match[1]) {
        parts.push(<span key={key++}>{match[1]}</span>);
      }
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
      remaining = remaining.slice(match[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts;
};

/**
 * Renders markdown-style content as formatted React elements
 */
export const renderMarkdown = (content: string): React.ReactNode => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      continue;
    }

    // H1: # Header
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={key++} className="text-xl font-bold font-serif text-foreground mt-6 mb-3 first:mt-0">
          {parseInlineMarkdown(trimmed.slice(2))}
        </h3>
      );
      continue;
    }

    // H2: ## Header
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h4 key={key++} className="text-lg font-semibold font-serif text-foreground mt-5 mb-2">
          {parseInlineMarkdown(trimmed.slice(3))}
        </h4>
      );
      continue;
    }

    // H3: ### Header
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h5 key={key++} className="text-base font-semibold text-foreground mt-4 mb-2">
          {parseInlineMarkdown(trimmed.slice(4))}
        </h5>
      );
      continue;
    }

    // Bold-only line (treated as subheading)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      elements.push(
        <h5 key={key++} className="text-base font-semibold text-foreground mt-4 mb-2">
          {trimmed.slice(2, -2)}
        </h5>
      );
      continue;
    }

    // Bullet points: - or • or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.slice(2);
      elements.push(
        <div key={key++} className="flex items-start gap-3 text-sm leading-relaxed ml-1">
          <span className="text-primary mt-0.5 font-bold">•</span>
          <span className="text-foreground/90">{parseInlineMarkdown(bulletContent)}</span>
        </div>
      );
      continue;
    }

    // Numbered lists: 1. item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-3 text-sm leading-relaxed ml-1">
          <span className="text-primary font-semibold min-w-[1.5rem]">{numberedMatch[1]}.</span>
          <span className="text-foreground/90">{parseInlineMarkdown(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular paragraph with inline formatting
    elements.push(
      <p key={key++} className="text-sm leading-relaxed text-foreground/90">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  }

  return <div className="space-y-2">{elements}</div>;
};
