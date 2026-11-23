import { websiteSources } from './config.js';
import { readWebsite } from './read.js';

export function enabledSources(defaults) {
  return websiteSources(defaults).filter(source => source.enabled !== false);
}

/** Host parsers are injected so the extension does not duplicate upstream parsing rules. */
export async function readSource(source, limit, { clean, summaryOf, parseFeed }, read = readWebsite) {
  const raw = await read(source.url);
  if (source.type !== 'page') return parseFeed(raw, limit);
  return [{
    title: clean(raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || source.name),
    url: source.url,
    summary: summaryOf(raw.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ''), 1500),
  }];
}
