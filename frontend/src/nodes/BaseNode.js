// BaseNode.js
// Reusable base component for all pipeline nodes.
// Handles layout, styling, and handle rendering so individual
// nodes only need to declare their title, content, and handles.

import { Handle } from 'reactflow';

/**
 * @param {object}  props
 * @param {string}  props.title          - Header label shown at the top of the card
 * @param {string}  [props.subtitle]     - Optional smaller text below the title
 * @param {React.ReactNode} props.children - Node body content (fields, labels, etc.)
 * @param {Array}   [props.handles]      - Array of handle descriptors (see shape below)
 * @param {object}  [props.style]        - Extra inline styles merged onto the card
 * @param {string}  [props.accentColor]  - Left-border accent color (defaults to #6366f1)
 * @param {string}  [props.headerColor]  - Header background color
 *
 * Handle descriptor shape:
 * {
 *   type:     'source' | 'target'
 *   position: Position.Left | Position.Right | Position.Top | Position.Bottom
 *   id:       string          – must be unique within the node
 *   style:    object          – optional extra inline styles
 *   label:    string          – optional small label rendered next to the handle
 * }
 */
export const BaseNode = ({
  title,
  subtitle,
  children,
  handles = [],
  style = {},
  accentColor = '#6366f1',
  headerColor,
}) => {
  const cardStyle = {
    minWidth: 220,
    minHeight: 80,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    borderLeft: `4px solid ${accentColor}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 13,
    color: '#1e293b',
    ...style,
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 12px 6px',
    borderBottom: '1px solid #f1f5f9',
    background: headerColor || `${accentColor}18`, // 18 = ~10% opacity hex
    borderRadius: '6px 6px 0 0',
  };

  const titleStyle = {
    fontWeight: 700,
    fontSize: 13,
    color: '#0f172a',
    letterSpacing: 0.2,
  };

  const subtitleStyle = {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  };

  const bodyStyle = {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  return (
    <div style={cardStyle}>
      {/* Handles */}
      {handles.map((h) => (
        <Handle
          key={h.id}
          type={h.type}
          position={h.position}
          id={h.id}
          style={h.style}
        />
      ))}

      {/* Header */}
      <div style={headerStyle}>
        <span style={titleStyle}>{title}</span>
        {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
      </div>

      {/* Body */}
      <div style={bodyStyle}>{children}</div>
    </div>
  );
};

// ─── Shared field primitives ──────────────────────────────────────────────────
// Small helpers so every node gets consistent field styling without extra imports.

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontSize: 12,
  color: '#475569',
  fontWeight: 500,
};

const inputStyle = {
  marginTop: 2,
  padding: '3px 7px',
  border: '1px solid #cbd5e1',
  borderRadius: 5,
  fontSize: 12,
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

/** Labeled text input */
export const FieldInput = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <label style={labelStyle}>
    {label}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={inputStyle}
    />
  </label>
);

/** Labeled select / dropdown */
export const FieldSelect = ({ label, value, onChange, options = [] }) => (
  <label style={labelStyle}>
    {label}
    <select value={value} onChange={onChange} style={selectStyle}>
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )
      )}
    </select>
  </label>
);

/** Labeled textarea */
export const FieldTextarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <label style={labelStyle}>
    {label}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.4 }}
    />
  </label>
);

/** Static info row (key: value) */
export const FieldInfo = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
    <span style={{ fontWeight: 500 }}>{label}</span>
    <span style={{ color: '#0f172a' }}>{value}</span>
  </div>
);
