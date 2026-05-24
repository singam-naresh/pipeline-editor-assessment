// inputNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput, FieldSelect } from './BaseNode';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  const handles = [
    { type: 'source', position: Position.Right, id: `${id}-value` },
  ];

  return (
    <BaseNode
      title="Input"
      subtitle="Pipeline entry point"
      handles={handles}
      accentColor="#10b981"
    >
      <FieldInput
        label="Name"
        value={currName}
        onChange={(e) => setCurrName(e.target.value)}
        placeholder="input_name"
      />
      <FieldSelect
        label="Type"
        value={inputType}
        onChange={(e) => setInputType(e.target.value)}
        options={['Text', 'File']}
      />
    </BaseNode>
  );
};
