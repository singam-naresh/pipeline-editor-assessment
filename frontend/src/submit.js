// submit.js

import { useState, useCallback } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

// ─── Store selector ───────────────────────────────────────────────────────────

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = 'http://127.0.0.1:8000/pipelines/parse';

// ─── Styles ───────────────────────────────────────────────────────────────────

const buttonStyle = (loading) => ({
  display:         'inline-flex',
  alignItems:      'center',
  gap:             8,
  padding:         '9px 28px',
  background:      loading ? '#94a3b8' : '#6366f1',
  color:           '#ffffff',
  border:          'none',
  borderRadius:    8,
  fontSize:        14,
  fontWeight:      600,
  fontFamily:      'Inter, system-ui, sans-serif',
  cursor:          loading ? 'not-allowed' : 'pointer',
  boxShadow:       loading ? 'none' : '0 2px 8px rgba(99,102,241,0.35)',
  transition:      'background 0.2s, box-shadow 0.2s',
  letterSpacing:   0.2,
});

const overlayStyle = {
  position:        'fixed',
  inset:           0,
  background:      'rgba(15,23,42,0.45)',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  zIndex:          9999,
  backdropFilter:  'blur(2px)',
};

const modalStyle = {
  background:      '#ffffff',
  borderRadius:    14,
  boxShadow:       '0 20px 60px rgba(0,0,0,0.18)',
  width:           360,
  maxWidth:        '90vw',
  fontFamily:      'Inter, system-ui, sans-serif',
  overflow:        'hidden',
};

const modalHeaderStyle = (isError) => ({
  padding:         '18px 24px 14px',
  borderBottom:    '1px solid #f1f5f9',
  background:      isError ? '#fef2f2' : '#f0fdf4',
  display:         'flex',
  alignItems:      'center',
  gap:             10,
});

const modalTitleStyle = (isError) => ({
  fontSize:        16,
  fontWeight:      700,
  color:           isError ? '#dc2626' : '#16a34a',
  margin:          0,
});

const modalBodyStyle = {
  padding:         '20px 24px',
  display:         'flex',
  flexDirection:   'column',
  gap:             12,
};

const statRowStyle = {
  display:         'flex',
  justifyContent:  'space-between',
  alignItems:      'center',
  padding:         '10px 14px',
  background:      '#f8fafc',
  borderRadius:    8,
  border:          '1px solid #e2e8f0',
};

const statLabelStyle = {
  fontSize:        13,
  color:           '#475569',
  fontWeight:      500,
};

const statValueStyle = (highlight) => ({
  fontSize:        14,
  fontWeight:      700,
  color:           highlight ? '#6366f1' : '#0f172a',
});

const dagBadgeStyle = (isDAG) => ({
  display:         'inline-flex',
  alignItems:      'center',
  gap:             5,
  padding:         '3px 10px',
  borderRadius:    20,
  fontSize:        13,
  fontWeight:      700,
  background:      isDAG ? '#dcfce7' : '#fee2e2',
  color:           isDAG ? '#16a34a' : '#dc2626',
  border:          `1px solid ${isDAG ? '#bbf7d0' : '#fecaca'}`,
});

const closeButtonStyle = {
  marginTop:       4,
  padding:         '9px 0',
  width:           '100%',
  background:      '#6366f1',
  color:           '#fff',
  border:          'none',
  borderRadius:    8,
  fontSize:        14,
  fontWeight:      600,
  cursor:          'pointer',
  fontFamily:      'Inter, system-ui, sans-serif',
  letterSpacing:   0.2,
};

const errorTextStyle = {
  fontSize:        13,
  color:           '#dc2626',
  lineHeight:      1.5,
  wordBreak:       'break-word',
};

// ─── Result Modal ─────────────────────────────────────────────────────────────

const ResultModal = ({ result, error, onClose }) => {
  const isError = Boolean(error);

  // Close on overlay click
  const handleOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle} role="dialog" aria-modal="true">
        {/* Header */}
        <div style={modalHeaderStyle(isError)}>
          <span style={{ fontSize: 22 }}>{isError ? '⚠️' : '✅'}</span>
          <h2 style={modalTitleStyle(isError)}>
            {isError ? 'Request Failed' : 'Pipeline Analysis'}
          </h2>
        </div>

        {/* Body */}
        <div style={modalBodyStyle}>
          {isError ? (
            <p style={errorTextStyle}>{error}</p>
          ) : (
            <>
              <div style={statRowStyle}>
                <span style={statLabelStyle}>Nodes</span>
                <span style={statValueStyle(true)}>{result.num_nodes}</span>
              </div>

              <div style={statRowStyle}>
                <span style={statLabelStyle}>Edges</span>
                <span style={statValueStyle(true)}>{result.num_edges}</span>
              </div>

              <div style={statRowStyle}>
                <span style={statLabelStyle}>Graph type</span>
                <span style={dagBadgeStyle(result.is_dag)}>
                  {result.is_dag ? '✓ Valid DAG' : '✗ Contains Cycle'}
                </span>
              </div>
            </>
          )}

          <button style={closeButtonStyle} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Submit Button ────────────────────────────────────────────────────────────

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);   // successful response
  const [error,   setError]     = useState(null);   // error message string
  const [open,    setOpen]      = useState(false);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        // Try to surface a meaningful message from the backend
        let detail = `Server error: ${response.status} ${response.statusText}`;
        try {
          const json = await response.json();
          if (json?.detail) detail = json.detail;
        } catch (_) { /* ignore parse errors */ }
        throw new Error(detail);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Network failures, CORS errors, JSON parse errors, etc.
      setError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the backend. Make sure the server is running on http://127.0.0.1:8000.'
          : err.message
      );
    } finally {
      setLoading(false);
      setOpen(true);
    }
  }, [nodes, edges]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
        <button
          style={buttonStyle(loading)}
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading && (
            <svg
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ animation: 'spin 0.8s linear infinite' }}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          )}
          {loading ? 'Analysing…' : 'Submit Pipeline'}
        </button>
      </div>

      {/* Spin keyframe — injected once as a style tag */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {open && (
        <ResultModal
          result={result}
          error={error}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
