// outputNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput, FieldSelect } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-value` },
  ];

  return (
    <BaseNode
      title="Output"
      subtitle="Pipeline exit point"
      handles={handles}
      accentColor="#f59e0b"
    >
      <FieldInput
        label="Name"
        value={currName}
        onChange={(e) => setCurrName(e.target.value)}
        placeholder="output_name"
      />
      <FieldSelect
        label="Type"
        value={outputType}
        onChange={(e) => setOutputType(e.target.value)}
        options={[
          { value: 'Text', label: 'Text' },
          { value: 'File', label: 'Image' },
        ]}
      />
    </BaseNode>
  );
};
