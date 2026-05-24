// apiNode.js
// Makes an HTTP request and passes the response downstream.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput, FieldSelect } from './BaseNode';

export const APINode = ({ id, data }) => {
  const [url, setUrl] = useState(data?.url || 'https://api.example.com/endpoint');
  const [method, setMethod] = useState(data?.method || 'GET');

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-body`,     style: { top: '40%' } },
    { type: 'target', position: Position.Left,  id: `${id}-headers`,  style: { top: '70%' } },
    { type: 'source', position: Position.Right, id: `${id}-response`, style: { top: '40%' } },
    { type: 'source', position: Position.Right, id: `${id}-status`,   style: { top: '70%' } },
  ];

  return (
    <BaseNode
      title="API Request"
      subtitle="HTTP call to external service"
      handles={handles}
      accentColor="#8b5cf6"
    >
      <FieldSelect
        label="Method"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE']}
      />
      <FieldInput
        label="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
      />
    </BaseNode>
  );
};
