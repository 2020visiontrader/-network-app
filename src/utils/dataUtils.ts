// Utility functions for data deduplication and array management

/**
 * Remove duplicates from an array based on a specific key
 */
export function dedupeBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Remove duplicates from an array based on a custom key function
 */
export function dedupeByKey<T>(array: T[], keyFn: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Get unique connections from bidirectional relationship data
 * Ensures A->B and B->A connections aren't counted twice
 */
export function getUniqueConnections(connections: Array<{
  founder_a_id: string;
  founder_b_id: string;
  [key: string]: any;
}>, currentUserId: string): Array<{
  founder_a_id: string;
  founder_b_id: string;
  [key: string]: any;
}> {
  const uniqueConnections = new Map();
  
  connections.forEach(conn => {
    // Create a stable key that's the same for A->B and B->A
    const ids = [conn.founder_a_id, conn.founder_b_id].sort();
    const key = `${ids[0]}-${ids[1]}`;
    
    // Only keep the first occurrence
    if (!uniqueConnections.has(key)) {
      uniqueConnections.set(key, conn);
    }
  });
  
  return Array.from(uniqueConnections.values());
}

/**
 * Get the other founder's ID from a connection
 */
export function getOtherFounderId(connection: {
  founder_a_id: string;
  founder_b_id: string;
}, currentUserId: string): string {
  return connection.founder_a_id === currentUserId 
    ? connection.founder_b_id 
    : connection.founder_a_id;
}
