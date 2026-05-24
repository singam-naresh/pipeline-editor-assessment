// databaseNode.js
// Reads from or writes to a database table.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, FieldInput, FieldSelect } from './BaseNode';

export const DatabaseNode = ({ id, data }) => {
  const [dbType, setDbType] = useState(data?.dbType || 'PostgreSQL');
  const [operation, setOperation] = useState(data?.operation || 'SELECT');
  const [table, setTable] = useState(data?.table || 'users');

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-query`  },
    { type: 'source', position: Position.Right, id: `${id}-result` },
    { type: 'source', position: Position.Right, id: `${id}-error`,  style: { top: '75%' } },
  ];

  return (
    <BaseNode
      title="Database"
      subtitle="Query or mutate a data store"
      handles={handles}
      accentColor="#14b8a6"
    >
      <FieldSelect
        label="Database"
        value={dbType}
        onChange={(e) => setDbType(e.target.value)}
        options={['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis']}
      />
      <FieldSelect
        label="Operation"
        value={operation}
        onChange={(e) => setOperation(e.target.value)}
        options={['SELECT', 'INSERT', 'UPDATE', 'DELETE']}
      />
      <FieldInput
        label="Table / Collection"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        placeholder="table_name"
      />
    </BaseNode>
  );
};
