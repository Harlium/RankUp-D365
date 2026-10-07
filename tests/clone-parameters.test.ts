import { buildCloneParameters, CloneAttributeInput } from '../src/content/modules/clone-parameters';

function attribute(partial: CloneAttributeInput): CloneAttributeInput {
  return partial;
}

describe('clone parameters', () => {
  test('keeps a lookup id, name, and type and drops system columns', () => {
    const parameters = buildCloneParameters([
      attribute({
        name: 'primarycontactid',
        type: 'lookup',
        value: [{ id: '{contact-id}', name: 'Ada Lovelace', entityType: 'contact' }],
      }),
      attribute({
        name: 'modifiedonbehalfby',
        type: 'lookup',
        value: [{ id: '{user-id}', name: 'System', entityType: 'systemuser' }],
      }),
      attribute({ name: 'createdon', type: 'datetime', value: '2020-01-01' }),
      attribute({
        name: 'ownerid',
        type: 'lookup',
        value: [{ id: '{owner}', entityType: 'systemuser' }],
      }),
      attribute({ name: 'statecode', type: 'optionset', value: 0 }),
      attribute({ name: 'name', type: 'string', value: 'Contoso' }),
    ]);

    expect(parameters).toEqual({
      primarycontactid: '{contact-id}',
      primarycontactidname: 'Ada Lovelace',
      primarycontactidtype: 'contact',
      name: 'Contoso',
    });
    expect(parameters).not.toHaveProperty('modifiedonbehalfby');
    expect(parameters).not.toHaveProperty('modifiedonbehalfbytype');
    expect(parameters).not.toHaveProperty('createdon');
    expect(parameters).not.toHaveProperty('ownerid');
    expect(parameters).not.toHaveProperty('statecode');
  });

  test('skips columns the user cannot create and types that are not form values', () => {
    const parameters = buildCloneParameters([
      attribute({ name: 'creditlimit', type: 'money', value: 10, canCreate: false }),
      attribute({ name: 'accountid', type: 'uniqueidentifier', value: '{id}' }),
      attribute({ name: 'donotemail', type: 'boolean', value: false }),
      attribute({ name: 'numberofemployees', type: 'integer', value: 0 }),
      attribute({ name: 'description', type: 'memo', value: 'Notes' }),
    ]);

    expect(parameters).toEqual({ description: 'Notes' });
  });
});
