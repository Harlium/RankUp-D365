import {
  cachedEntitySetName,
  emptyEntitySetNameCache,
  entitySetNameCacheKey,
  entitySetNameFromRecord,
  findEntitySetName,
  isSafeLogicalName,
  parseEntitySetNameCache,
  rememberEntitySetName,
} from '../src/content/modules/entity-set-name';

describe('entity set names', () => {
  test('uses EntitySetName and ignores a different LogicalCollectionName', () => {
    expect(
      entitySetNameFromRecord({
        LogicalName: 'opportunity',
        EntitySetName: 'opportunities',
        LogicalCollectionName: 'opportunitys',
      })
    ).toBe('opportunities');
  });

  test('does not guess a plural when EntitySetName is missing', () => {
    expect(
      entitySetNameFromRecord({
        LogicalName: 'account',
        LogicalCollectionName: 'accounts',
      })
    ).toBeNull();
  });

  test('reads EntitySetName regardless of property casing', () => {
    expect(
      entitySetNameFromRecord({
        logicalname: 'new_city',
        entitysetname: 'new_cities',
      })
    ).toBe('new_cities');
  });

  test('finds irregular and already-plural collection names', () => {
    const entities = [
      { LogicalName: 'opportunity', EntitySetName: 'opportunities' },
      { LogicalName: 'party', EntitySetName: 'parties' },
      { LogicalName: 'new_city', EntitySetName: 'new_cities' },
    ];

    expect(findEntitySetName(entities, 'Opportunity')).toBe('opportunities');
    expect(findEntitySetName(entities, 'party')).toBe('parties');
    expect(findEntitySetName(entities, 'new_city')).toBe('new_cities');
    expect(findEntitySetName(entities, 'account')).toBeNull();
  });

  test('rejects logical names that are not safe to interpolate into a filter', () => {
    expect(isSafeLogicalName('account')).toBe(true);
    expect(isSafeLogicalName('new_custom_table')).toBe(true);
    expect(isSafeLogicalName("account' or 1 eq 1")).toBe(false);
    expect(isSafeLogicalName('')).toBe(false);
    expect(isSafeLogicalName('1account')).toBe(false);
  });

  test('remembers resolved names in a host-scoped cache', () => {
    const key = entitySetNameCacheKey('ORG.crm.dynamics.com');
    expect(key).toBe('levelup_entity_set_names_org.crm.dynamics.com');
    expect(entitySetNameCacheKey('  ')).toBe('levelup_entity_set_names');

    const stored = rememberEntitySetName(
      emptyEntitySetNameCache(),
      'opportunity',
      'opportunities',
      10
    );
    const raw = JSON.stringify(stored);
    const parsed = parseEntitySetNameCache(raw);

    expect(cachedEntitySetName(parsed, 'Opportunity')).toBe('opportunities');
    expect(parseEntitySetNameCache('not-json')).toEqual(emptyEntitySetNameCache());
    expect(parseEntitySetNameCache(null)).toEqual(emptyEntitySetNameCache());
  });
});
