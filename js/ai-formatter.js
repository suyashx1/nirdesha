/**
 * Nirdesha AI Visual Formatting Layer
 * Intercepts all AI outputs before rendering to screen across both AI Study Mentor and Guidance.
 * Converts:
 * - Bold: **word** or __word__ -> <strong>word</strong> (eliminates raw ** signs)
 * - Italic: *word* or _word_ -> <em>word</em> (eliminates raw * signs)
 * - Squares / Powers: x^2, R^2, cm^2, ², ³ -> x<sup>2</sup>, <sup>2</sup>, <sup>3</sup>
 * - Subscripts: y_i, Y_{HT}, x_1 -> y<sub>i</sub>, Y<sub>HT</sub>, x<sub>1</sub>
 * - Fractions & Formulas: \frac{num}{den}, $, $$ -> rendered mathematical layout with KaTeX or rich visual fraction
 * - Brackets: proper styled math brackets [ ], ( ), { }
 * - Tables: Pipe tables -> clean executive styled responsive tables
 * - Lists & Enter: Enters / linebreaks preserved cleanly with proper paragraph spacing
 */
(function(window) {
  'use strict';

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMath(formula, isDisplay) {
    if (!formula) return '';
    const trimmed = formula.trim();

    // 1. Try KaTeX if loaded
    if (window.katex && typeof window.katex.renderToString === 'function') {
      try {
        return window.katex.renderToString(trimmed, {
          displayMode: isDisplay,
          throwOnError: false
        });
      } catch (e) {}
    }

    // 2. High-Fidelity Custom Visual Math Layer
    let clean = trimmed;
    clean = clean.replace(/\\text\{([^}]+)\}/g, '$1');
    clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="ai-fraction"><span class="ai-num">$1</span><span class="ai-den">$2</span></span>');
    clean = clean.replace(/\\sqrt\{([^}]+)\}/g, '<span class="ai-sqrt">&radic;<span class="ai-sqrt-stem">$1</span></span>');
    clean = clean.replace(/\\times/g, '&times;')
                 .replace(/\\cdot/g, '&sdot;')
                 .replace(/\\sum/g, '&sum;')
                 .replace(/\\pi/g, '&pi;')
                 .replace(/\\sigma/g, '&sigma;')
                 .replace(/\\mu/g, '&mu;')
                 .replace(/\\alpha/g, '&alpha;')
                 .replace(/\\beta/g, '&beta;')
                 .replace(/\\theta/g, '&theta;')
                 .replace(/\\le(q)?/g, '&le;')
                 .replace(/\\ge(q)?/g, '&ge;')
                 .replace(/\\neq/g, '&ne;')
                 .replace(/\\approx/g, '&asymp;')
                 .replace(/([a-zA-Z0-9_\)]+)\^\{?([a-zA-Z0-9+\-]+)\}?/g, '$1<sup>$2</sup>')
                 .replace(/([a-zA-Z0-9\)]+)_\{?([a-zA-Z0-9+\-]+)\}?/g, '$1<sub>$2</sub>');

    if (isDisplay) {
      return `<div class="ai-math-display">${clean}</div>`;
    } else {
      return `<span class="ai-math-inline">${clean}</span>`;
    }
  }

  function renderTable(tableLines) {
    if (!tableLines || tableLines.length < 2) return tableLines.join('<br>');

    const headerLine = tableLines[0];
    const rowLines = tableLines.slice(2);

    const rawHeaders = headerLine.split('|');
    const headers = rawHeaders.slice(1, rawHeaders.length - 1).map(h => h.trim());
    if (headers.length === 0) return tableLines.join('<br>');

    let html = '<div class="ai-table-wrap"><table class="ai-table"><thead><tr>';
    headers.forEach(h => {
      html += `<th>${formatInline(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    rowLines.forEach(row => {
      const rawCells = row.split('|');
      const cells = rawCells.slice(1, rawCells.length - 1).map(c => c.trim());
      if (cells.length > 0) {
        html += '<tr>';
        cells.forEach(cell => {
          let extraClass = '';
          const lower = cell.toLowerCase();
          if (lower.includes('exceeded') || lower.includes('pass') || lower.includes('expert') || lower.includes('100%') || lower.includes('complete')) {
            extraClass = ' class="status-cell-pass"';
          } else if (lower.includes('gap') || lower.includes('needs focus') || lower.includes('below') || lower.includes('warning')) {
            extraClass = ' class="status-cell-gap"';
          }
          html += `<td${extraClass}>${formatInline(cell)}</td>`;
        });
        html += '</tr>';
      }
    });

    html += '</tbody></table></div>';
    return html;
  }

  function formatInline(text) {
    if (!text) return '';

    // 1. Math formulas: $...$
    text = text.replace(/\$([^$\n]+)\$/g, function(match, math) {
      return renderMath(math, false);
    });

    // 2. Bold text: **word** or __word__
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // 3. Italic text: *word* or _word_ (ensuring not in math/tags)
    text = text.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    text = text.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, '$1<em>$2</em>$3');

    // 4. Standalone squares / powers: e.g. x^2, R^2, m^2, ², ³
    text = text.replace(/\b([a-zA-Z0-9]+)\^([0-9]+)\b/g, '$1<sup>$2</sup>');
    text = text.replace(/²|\^2/g, '<sup>2</sup>');
    text = text.replace(/³|\^3/g, '<sup>3</sup>');

    // 5. Standalone subscripts: e.g. y_i, x_1
    text = text.replace(/\b([a-zA-Z])_([a-zA-Z0-9]+)\b/g, '$1<sub>$2</sub>');

    // 6. Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code class="ai-code-pill">$1</code>');

    // 7. Clean any remaining unparsed raw ** signs so they never show
    text = text.replace(/\*\*/g, '');

    return text;
  }

  function formatAIMessage(rawText) {
    if (!rawText) return '';

    // 1. Display math blocks: $$...$$
    const displayMathBlocks = [];
    let text = rawText.replace(/\$\$([\s\S]*?)\$\$/g, function(match, math) {
      const token = `⟦NIRDESHA_MATH_${displayMathBlocks.length}⟧`;
      displayMathBlocks.push(renderMath(math, true));
      return token;
    });

    // 2. Code blocks: ```lang ... ```
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\s*([\s\S]*?)```/g, function(match, lang, code) {
      const token = `⟦NIRDESHA_CODE_${codeBlocks.length}⟧`;
      codeBlocks.push(`<pre class="ai-pre-code"><div class="ai-code-header">${escapeHtml(lang || 'Code')}</div><code>${escapeHtml(code.trim())}</code></pre>`);
      return token;
    });

    const lines = text.split(/\r?\n/);
    const output = [];
    let inTable = false;
    let tableBuffer = [];
    let inList = false;
    let listType = null; // 'ul' or 'ol'

    function closeList() {
      if (inList) {
        output.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
    }

    function closeTable() {
      if (inTable) {
        output.push(renderTable(tableBuffer));
        inTable = false;
        tableBuffer = [];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
        closeList();
        inTable = true;
        tableBuffer.push(trimmed);
        continue;
      } else if (inTable) {
        closeTable();
      }

      // Direct Passthrough for Display Math & Code Blocks (No <p> wrapping)
      if (trimmed.startsWith('⟦NIRDESHA_MATH_') || trimmed.startsWith('⟦NIRDESHA_CODE_')) {
        closeList();
        output.push(trimmed);
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        closeList();
        output.push(`<h4 class="ai-msg-h4">${formatInline(trimmed.slice(4))}</h4>`);
        continue;
      } else if (trimmed.startsWith('## ')) {
        closeList();
        output.push(`<h3 class="ai-msg-h3">${formatInline(trimmed.slice(3))}</h3>`);
        continue;
      }

      // Bullet list item
      const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          closeList();
          output.push('<ul class="ai-bullet-list">');
          inList = true;
          listType = 'ul';
        }
        output.push(`<li>${formatInline(bulletMatch[1])}</li>`);
        continue;
      }

      // Numbered list item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!inList || listType !== 'ol') {
          closeList();
          output.push('<ol class="ai-num-list">');
          inList = true;
          listType = 'ol';
        }
        output.push(`<li>${formatInline(numMatch[2])}</li>`);
        continue;
      }

      closeList();

      if (!trimmed) {
        output.push('<div class="ai-spacer"></div>');
      } else {
        output.push(`<p class="ai-msg-p">${formatInline(trimmed)}</p>`);
      }
    }

    closeList();
    closeTable();

    let result = output.join('\n');

    // Restore display math blocks cleanly
    displayMathBlocks.forEach((block, idx) => {
      result = result.split(`⟦NIRDESHA_MATH_${idx}⟧`).join(block);
    });

    // Restore code blocks cleanly
    codeBlocks.forEach((block, idx) => {
      result = result.split(`⟦NIRDESHA_CODE_${idx}⟧`).join(block);
    });

    // Safety sweep: eliminate any stray placeholder artifacts
    result = result.replace(/___DISPLAY_?MATH_?\d*___/gi, '');
    result = result.replace(/___CODE_?BLOCK_?\d*___/gi, '');
    result = result.replace(/⟦NIRDESHA_.*?⟧/g, '');

    return result;
  }

  window.NirdeshaFormatter = {
    format: formatAIMessage
  };
})(typeof window !== 'undefined' ? window : globalThis);
