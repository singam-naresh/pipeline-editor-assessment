// toolbar.js

import { DraggableNode } from './draggableNode';

const ORIGINAL_NODES = [
  { type: 'customInput',  label: 'Input'    },
  { type: 'llm',          label: 'LLM'      },
  { type: 'customOutput', label: 'Output'   },
  { type: 'text',         label: 'Text'     },
];

const DEMO_NODES = [
  { type: 'api',      label: 'API'      },
  { type: 'filter',   label: 'Filter'   },
  { type: 'database', label: 'Database' },
  { type: 'decision', label: 'Decision' },
  { type: 'delay',    label: 'Delay'    },
];

const groupLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  marginBottom: 4,
};

export const PipelineToolbar = () => (
  <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
    <div style={{ marginBottom: 10 }}>
      <div style={groupLabelStyle}>Core Nodes</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ORIGINAL_NODES.map(({ type, label }) => (
          <DraggableNode key={type} type={type} label={label} />
        ))}
      </div>
    </div>
    <div>
      <div style={groupLabelStyle}>Demo Nodes</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DEMO_NODES.map(({ type, label }) => (
          <DraggableNode key={type} type={type} label={label} />
        ))}
      </div>
    </div>
  </div>
);
