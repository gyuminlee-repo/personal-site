/**
 * italicize — convert `*foo*` markdown spans into `<em class="italic">foo</em>`.
 *
 * Used for Latin organism names (e.g. *Methylorubrum extorquens*) in bio data
 * so we can store italic markers in plain JSON without leaking raw HTML.
 *
 * Strings are author-controlled (bio.{en,ko}.json) and never user input, so we
 * intentionally do NOT html-escape — set:html consumers can render the result
 * directly. Do not pass untrusted strings through this helper.
 */
export function italicize(s: string): string {
  if (typeof s !== 'string' || s.length === 0) return s;
  return s.replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>');
}
