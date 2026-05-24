// decisionNode.js
// Branches the pipeline into two paths based on a boolean expression.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput } from './BaseNode';

export const DecisionNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || 'data.score > 0.5');

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-input` },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-true`,
      style: { top: '35%' },
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-false`,
      style: { top: '70%' },
    },
  ];

  return (
    <BaseNode
      title="Decision"
      subtitle="Branch on true / false"
      handles={handles}
      accentColor="#f97316"
    >
      <FieldInput
        label="Condition"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        placeholder="data.field === 'value'"
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, fontSize: 11, color: '#64748b', marginTop: 2 }}>
        <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ true →</span>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ false →</span>
      </div>
    </BaseNode>
  );
};
