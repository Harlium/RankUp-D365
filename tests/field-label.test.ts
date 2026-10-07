/**
 * @jest-environment jsdom
 */
import { fieldLabelIdMatches, findFieldLabelElement } from '../src/content/modules/field-label';

describe('logical name field labels', () => {
  test('does not treat a longer logical name as a shorter one', () => {
    expect(fieldLabelIdMatches('accountname-field-label', 'name')).toBe(false);
    expect(fieldLabelIdMatches('name-field-label', 'name')).toBe(true);
    expect(fieldLabelIdMatches('parentaccountid-field-label', 'id')).toBe(false);
    expect(fieldLabelIdMatches('accountid-field-label', 'id')).toBe(false);
    expect(fieldLabelIdMatches('id-field-label', 'id')).toBe(true);
  });

  test('allows a delimiter before the logical name and rejects a name character', () => {
    expect(fieldLabelIdMatches('quickform-name-field-label', 'name')).toBe(true);
    expect(fieldLabelIdMatches('header_name-field-label', 'name')).toBe(false);
  });

  test('prefers the exact label when a delimited id is also present', () => {
    document.body.innerHTML = `
      <label id="quickform-name-field-label">Quick name</label>
      <label id="accountname-field-label">Account Name</label>
      <label id="name-field-label">Name</label>
    `;

    expect(findFieldLabelElement(document, 'name')?.id).toBe('name-field-label');
    expect(findFieldLabelElement(document, 'accountname')?.id).toBe('accountname-field-label');
    expect(findFieldLabelElement(document, 'telephone1')).toBeNull();
  });
});
