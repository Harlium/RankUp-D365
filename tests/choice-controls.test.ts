import {
  isChoiceControlType,
  readChoiceOptions,
  ChoiceControlSource,
} from '../src/content/modules/choice-controls';

describe('choice controls', () => {
  test('includes option sets, multi-select choices, and Two Options', () => {
    expect(isChoiceControlType('optionset')).toBe(true);
    expect(isChoiceControlType('multiselectoptionset')).toBe(true);
    expect(isChoiceControlType('boolean')).toBe(true);
    expect(isChoiceControlType('string')).toBe(false);
    expect(isChoiceControlType(undefined)).toBe(false);
  });

  test('reads options from the control when it has them', () => {
    const control: ChoiceControlSource = {
      getOptions: () => [
        { text: 'Open', value: 0 },
        { text: 'Won', value: 1 },
      ],
      getAttribute: () => ({
        getOptions: () => [{ text: 'Ignored', value: 9 }],
      }),
    };

    expect(readChoiceOptions(control)).toEqual([
      { text: 'Open', value: 0 },
      { text: 'Won', value: 1 },
    ]);
  });

  test('falls back to the attribute for Two Options controls', () => {
    const control: ChoiceControlSource = {
      getAttribute: () => ({
        getOptions: () => [
          { text: 'Yes', value: 1 },
          { text: 'No', value: 0 },
        ],
      }),
    };

    expect(readChoiceOptions(control)).toEqual([
      { text: 'Yes', value: 1 },
      { text: 'No', value: 0 },
    ]);
  });

  test('returns an empty list when neither control nor attribute exposes options', () => {
    expect(readChoiceOptions({})).toEqual([]);
    expect(readChoiceOptions({ getOptions: () => [] })).toEqual([]);
  });
});
