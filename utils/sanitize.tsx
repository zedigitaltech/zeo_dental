import React from 'react';

const ALLOWED_TAGS = ['strong', 'em', 'b', 'i'];

/**
 * Safely render HTML strings that only contain whitelisted tags (strong, em, b, i).
 * All other HTML is stripped. This prevents XSS from translation strings.
 */
export function sanitizeHtml(html: string): React.ReactNode[] {
  const tagPattern = new RegExp(`<(/?)(${ALLOWED_TAGS.join('|')})(\\s[^>]*)?>`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const stack: { tag: string; children: React.ReactNode[] }[] = [];
  let current: React.ReactNode[] = parts;

  const regex = new RegExp(tagPattern);
  let match;

  while ((match = regex.exec(html)) !== null) {
    const [fullMatch, isClosing, tagName] = match;
    const textBefore = html.slice(lastIndex, match.index);

    if (textBefore) {
      current.push(textBefore);
    }

    const normalizedTag = tagName.toLowerCase();

    if (isClosing) {
      if (stack.length > 0 && stack[stack.length - 1].tag === normalizedTag) {
        const { tag, children } = stack.pop()!;
        current = stack.length > 0 ? stack[stack.length - 1].children : parts;
        const Tag = tag as keyof React.JSX.IntrinsicElements;
        current.push(React.createElement(Tag, { key: `${tag}-${match.index}` }, ...children));
      }
    } else {
      const newChildren: React.ReactNode[] = [];
      stack.push({ tag: normalizedTag, children: newChildren });
      current = newChildren;
    }

    lastIndex = match.index + fullMatch.length;
  }

  const remaining = html.slice(lastIndex);
  if (remaining) {
    // Strip any unmatched HTML tags from remaining text
    current.push(remaining.replace(/<[^>]*>/g, ''));
  }

  // If stack is not empty, flush remaining children as plain text
  while (stack.length > 0) {
    const { children } = stack.pop()!;
    const parent = stack.length > 0 ? stack[stack.length - 1].children : parts;
    parent.push(...children);
  }

  return parts;
}
