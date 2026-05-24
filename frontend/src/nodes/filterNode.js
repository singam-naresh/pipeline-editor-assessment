// filterNode.js
// Filters data passing through the pipeline based on a condition.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput, FieldSelect } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const [field, setField] = useState(data?.field || 'value');
  const [operator, setOperator] = useState(data?.operator || 'equals');
  const [filterValue, setFilterValue] = useState(data?.filterValue || '');

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-pass`,  style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-fail`,  style: { top: '70%' } },
  ];

  return (
    <BaseNode
      title="Filter"
      subtitle="Route data by condition"
      handles={handles}
      accentColor="#ec4899"
    >
      <FieldInput
        label="Field"
        value={field}
        onChange={(e) => setField(e.target.value)}
        placeholder="field.name"
      />
      <FieldSelect
        label="Operator"
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        options={[
          { value: 'equals',      label: '= equals' },
          { value: 'not_equals',  label: '≠ not equals' },
          { value: 'contains',    label: '⊃ contains' },
          { value: 'gt',          label: '> greater than' },
          { value: 'lt',          label: '< less than' },
        ]}
      />
      <FieldInput
        label="Value"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder="compare value"
      />
    </BaseNode>
  );
};
