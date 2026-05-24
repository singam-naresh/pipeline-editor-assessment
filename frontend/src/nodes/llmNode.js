// llmNode.js

import { Position } from 'reactflow';
import { BaseNode, FieldInfo } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-system`,
      style: { top: '33%' },
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-prompt`,
      style: { top: '67%' },
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-response`,
    },
  ];

  return (
    <BaseNode
      title="LLM"
      subtitle="Language model inference"
      handles={handles}
      accentColor="#6366f1"
    >
      <FieldInfo label="Input (system)" value="← left top" />
      <FieldInfo label="Input (prompt)" value="← left bottom" />
      <FieldInfo label="Output (response)" value="right →" />
    </BaseNode>
  );
};
