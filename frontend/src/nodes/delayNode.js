// delayNode.js
// Pauses pipeline execution for a configurable duration.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput, FieldSelect } from './BaseNode';

export const DelayNode = ({ id, data }) => {
  const [duration, setDuration] = useState(data?.duration || '1');
  const [unit, setUnit] = useState(data?.unit || 'seconds');

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-input`  },
    { type: 'source', position: Position.Right, id: `${id}-output` },
  ];

  const totalMs =
    unit === 'milliseconds' ? Number(duration)
    : unit === 'seconds'    ? Number(duration) * 1000
    : unit === 'minutes'    ? Number(duration) * 60000
    :                         Number(duration) * 3600000;

  return (
    <BaseNode
      title="Delay"
      subtitle="Pause before continuing"
      handles={handles}
      accentColor="#64748b"
    >
      <FieldInput
        label="Duration"
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="1"
      />
      <FieldSelect
        label="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        options={['milliseconds', 'seconds', 'minutes', 'hours']}
      />
      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
        ≈ {totalMs.toLocaleString()} ms total
      </div>
    </BaseNode>
  );
};
