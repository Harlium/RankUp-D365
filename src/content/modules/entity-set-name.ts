// Resolve Dataverse Web API entity set names from metadata.
// EntitySetName is the URL segment. LogicalCollectionName often matches it,
// but Microsoft documents them as different properties, so this module never
// guesses a plural by appending "s".

export interface EntityNameRecord {
  LogicalName?: string;
  EntitySetName?: string;
  LogicalCollectionName?: string;
  [key: string]: unknown;
}

export interface EntitySetNameCacheFile {
  names: Record<string, string>;
  timestamp: number;
}

const LOGICAL_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

export function isSafeLogicalName(name: string): boolean {
  return LOGICAL_NAME_PATTERN.test(name);
}

function readStringProperty(record: EntityNameRecord, propertyName: string): string | null {
  const direct = record[propertyName];
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }

  const wanted = propertyName.toLowerCase();
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() === wanted && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

/**
 * Web API collection name for one metadata row. Ignores LogicalCollectionName.
 */
export function entitySetNameFromRecord(
  record: EntityNameRecord | null | undefined
): string | null {
  if (!record) {
    return null;
  }
  return readStringProperty(record, 'EntitySetName');
}

export function findEntitySetName(
  entities: readonly EntityNameRecord[] | null | undefined,
  logicalName: string
): string | null {
  if (!entities?.length || !logicalName) {
    return null;
  }

  const wanted = logicalName.toLowerCase();
  for (const entity of entities) {
    const name = readStringProperty(entity, 'LogicalName');
    if (name && name.toLowerCase() === wanted) {
      return entitySetNameFromRecord(entity);
    }
  }

  return null;
}

export function emptyEntitySetNameCache(): EntitySetNameCacheFile {
  return { names: {}, timestamp: 0 };
}

export function parseEntitySetNameCache(raw: string | null): EntitySetNameCacheFile {
  if (!raw) {
    return emptyEntitySetNameCache();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<EntitySetNameCacheFile>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.names ||
      typeof parsed.names !== 'object'
    ) {
      return emptyEntitySetNameCache();
    }

    const names: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.names)) {
      if (typeof value === 'string' && value.trim()) {
        names[key.toLowerCase()] = value.trim();
      }
    }

    return {
      names,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : 0,
    };
  } catch {
    return emptyEntitySetNameCache();
  }
}

export function cachedEntitySetName(
  cache: EntitySetNameCacheFile,
  logicalName: string
): string | null {
  const name = cache.names[logicalName.toLowerCase()];
  return name || null;
}

export function rememberEntitySetName(
  cache: EntitySetNameCacheFile,
  logicalName: string,
  entitySetName: string,
  timestamp = Date.now()
): EntitySetNameCacheFile {
  return {
    names: {
      ...cache.names,
      [logicalName.toLowerCase()]: entitySetName,
    },
    timestamp,
  };
}

export function entitySetNameCacheKey(hostname: string): string {
  const host = hostname.trim().toLowerCase();
  return host ? `levelup_entity_set_names_${host}` : 'levelup_entity_set_names';
}
