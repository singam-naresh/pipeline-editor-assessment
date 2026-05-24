// textNode.js
// Enhanced with dynamic variable parsing, auto-resize, and live handles.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';

// ─── Variable parsing ─────────────────────────────────────────────────────────

/**
 * Extract unique, valid JS-identifier variable names from {{...}} tokens.
 * - Strips whitespace inside braces
 * - Ignores duplicates
 * - Ignores names that aren't valid JS identifiers (e.g. {{123}}, {{a-b}})
 */
const VARIABLE_REGEX = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/g;

function parseVariables(text) {
  const seen = new Set();
  let match;
  // Reset lastIndex each call since we reuse the regex constant
  VARIABLE_REGEX.lastIndex = 0;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    seen.add(match[1]);
  }
  return Array.from(seen);
}

// ─── Auto-resize hook ─────────────────────────────────────────────────────────

/**
 * Returns a ref to attach to a textarea and the measured { width, height }.
 * Uses a hidden mirror div so measurement is synchronous and doesn't cause
 * the textarea to flash at the wrong size on first render.
 *
 * @param {string} text        - Current textarea value
 * @param {object} fontMetrics - { fontSize, fontFamily, lineHeight, padding }
 * @param {{ min: number, max: number }} widthBounds
 * @param {{ min: number, max: number }} heightBounds
 */
function useAutoResize(text, fontMetrics, widthBounds, heightBounds) {
  const mirrorRef = useRef(null);
  const [size, setSize] = useState({ width: widthBounds.min, height: heightBounds.min });

  // Create the hidden mirror div once
  useEffect(() => {
    const mirror = document.createElement('div');
    Object.assign(mirror.style, {
      position:   'absolute',
      top:        '-9999px',
      left:       '-9999px',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap',
      wordBreak:  'break-word',
      overflowWrap: 'break-word',
      fontSize:   fontMetrics.fontSize,
      fontFamily: fontMetrics.fontFamily,
      lineHeight: String(fontMetrics.lineHeight),
      padding:    fontMetrics.padding,
      border:     '1px solid transparent',
      boxSizing:  'border-box',
    });
    document.body.appendChild(mirror);
    mirrorRef.current = mirror;
    return () => document.body.removeChild(mirror);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mirror = mirrorRef.current;
    if (!mirror) return;

    // Set width to min so we measure natural wrap behaviour
    mirror.style.width = `${widthBounds.min}px`;
    // Append a trailing space so the mirror captures a trailing newline
    mirror.textContent = text + ' ';

    const naturalW = Math.min(
      Math.max(mirror.scrollWidth, widthBounds.min),
      widthBounds.max
    );
    // Now fix width and measure height
    mirror.style.width = `${naturalW}px`;
    const naturalH = Math.min(
      Math.max(mirror.scrollHeight, heightBounds.min),
      heightBounds.max
    );

    setSize((prev) => {
      if (prev.width === naturalW && prev.height === naturalH) return prev;
      return { width: naturalW, height: naturalH };
    });
  }, [text, widthBounds.min, widthBounds.max, heightBounds.min, heightBounds.max]);

  return size;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ACCENT = '#0ea5e9';

const cardStyle = (width) => ({
  width,
  minWidth: 220,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  borderLeft: `4px solid ${ACCENT}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 13,
  color: '#1e293b',
  position: 'relative',
  boxSizing: 'border-box',
});

const headerStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 12px 6px',
  borderBottom: '1px solid #f1f5f9',
  background: `${ACCENT}18`,
  borderRadius: '6px 6px 0 0',
};

const bodyStyle = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontSize: 12,
  color: '#475569',
  fontWeight: 500,
};

const textareaBaseStyle = {
  marginTop: 2,
  padding: '4px 7px',
  border: '1px solid #cbd5e1',
  borderRadius: 5,
  fontSize: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
  lineHeight: 1.5,
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  resize: 'none',          // we handle sizing ourselves
  overflow: 'hidden',      // no scrollbar flash
  boxSizing: 'border-box',
  display: 'block',
  transition: 'width 80ms ease, height 80ms ease',
};

const varPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 10,
  fontWeight: 600,
  color: ACCENT,
  background: `${ACCENT}14`,
  border: `1px solid ${ACCENT}40`,
  borderRadius: 4,
  padding: '1px 6px',
  marginRight: 4,
  marginBottom: 2,
  letterSpacing: 0.2,
};

const handleLabelStyle = {
  position: 'absolute',
  left: 14,
  fontSize: 10,
  color: '#64748b',
  fontFamily: 'Inter, system-ui, sans-serif',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  transform: 'translateY(-50%)',
};

// ─── Component ────────────────────────────────────────────────────────────────

const FONT_METRICS = {
  fontSize:   '12px',
  fontFamily: 'Inter, system-ui, sans-serif',
  lineHeight: 1.5,
  padding:    '4px 7px',
};

const WIDTH_BOUNDS  = { min: 220, max: 480 };
const HEIGHT_BOUNDS = { min: 48,  max: 320 };

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');

  // Parse variables — memoised so it only recomputes when text changes
  const variables = useMemo(() => parseVariables(currText), [currText]);

  // Auto-resize textarea dimensions
  const { width: taWidth, height: taHeight } = useAutoResize(
    currText,
    FONT_METRICS,
    WIDTH_BOUNDS,
    HEIGHT_BOUNDS
  );

  // Card width tracks textarea width + card horizontal chrome (border-left 4px + padding 12px*2)
  const cardWidth = taWidth + 28;

  const handleChange = useCallback((e) => setCurrText(e.target.value), []);

  // ── Handle layout ──────────────────────────────────────────────────────────
  // We need the rendered node height to space handles evenly.
  // Estimate: header ≈ 52px, body padding top/bottom = 20px, label row = 18px,
  // textarea = taHeight, variable pills row = variables.length > 0 ? 24 : 0
  const pillRowH   = variables.length > 0 ? 24 : 0;
  const nodeHeight = 52 + 20 + 18 + taHeight + pillRowH + 8; // 8 = gap

  // Fixed output handle — vertically centred
  const outputHandleTop = nodeHeight / 2;

  // Variable handles — evenly distributed in the left side
  // Reserve top/bottom margins so handles don't sit at the very edge
  const HANDLE_MARGIN = 24;
  const usableHeight  = nodeHeight - HANDLE_MARGIN * 2;
  const step = variables.length > 1 ? usableHeight / (variables.length - 1) : 0;

  const varHandles = variables.map((name, i) => ({
    id:    `${id}-var-${name}`,
    name,
    top:   variables.length === 1
             ? nodeHeight / 2
             : HANDLE_MARGIN + i * step,
  }));

  return (
    <div style={cardStyle(cardWidth)}>
      {/* ── Variable (target) handles — left side ── */}
      {varHandles.map(({ id: hid, name, top }) => (
        <div key={hid}>
          <Handle
            type="target"
            position={Position.Left}
            id={hid}
            style={{ top, background: ACCENT, border: `2px solid ${ACCENT}` }}
          />
          <span style={{ ...handleLabelStyle, top }}>
            {name}
          </span>
        </div>
      ))}

      {/* ── Output (source) handle — right side ── */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{ top: outputHandleTop }}
      />

      {/* ── Header ── */}
      <div style={headerStyle}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', letterSpacing: 0.2 }}>
          Text
        </span>
        <span style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
          Static or templated text
        </span>
      </div>

      {/* ── Body ── */}
      <div style={bodyStyle}>
        <label style={labelStyle}>
          Content
          <textarea
            value={currText}
            onChange={handleChange}
            placeholder="Enter text or use {{variable}}"
            style={{
              ...textareaBaseStyle,
              width:  taWidth,
              height: taHeight,
            }}
            // Prevent ReactFlow from intercepting keyboard events inside the textarea
            onKeyDown={(e) => e.stopPropagation()}
          />
        </label>

        {/* Variable pills */}
        {variables.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 2 }}>
            {variables.map((v) => (
              <span key={v} style={varPillStyle}>
                &#123;&#123;{v}&#125;&#125;
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
