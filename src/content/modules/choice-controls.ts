// Choice columns on a model-driven form: option sets, multi-select choices,
// and Two Options (boolean) controls.

import { OptionSetOption } from '#types/global';

export const CHOICE_CONTROL_TYPES = ['optionset', 'multiselectoptionset', 'boolean'] as const;

export type ChoiceControlType = (typeof CHOICE_CONTROL_TYPES)[number];

export interface ChoiceOptionSource {
  text?: string;
  value?: number | null;
}

export interface ChoiceAttributeSource {
  getOptions?: () => ChoiceOptionSource[] | null | undefined;
}

export interface ChoiceControlSource {
  getControlType?: () => string;
  getName?: () => string;
  getOptions?: () => ChoiceOptionSource[] | null | undefined;
  getAttribute?: () => ChoiceAttributeSource | null | undefined;
}

export function isChoiceControlType(controlType: string | undefined | null): boolean {
  return (
    controlType === 'optionset' ||
    controlType === 'multiselectoptionset' ||
    controlType === 'boolean'
  );
}

function normalizeOptions(
  options: ChoiceOptionSource[] | null | undefined
): OptionSetOption[] | null {
  if (!options || options.length === 0) {
    return null;
  }

  return options.map(option => ({
    text: option.text ?? '',
    value: option.value === undefined ? null : option.value,
  }));
}

/**
 * Option sets expose getOptions on the control. Two Options and some choice
 * controls only expose it on the attribute. Either source is accepted.
 */
export function readChoiceOptions(control: ChoiceControlSource): OptionSetOption[] {
  const fromControl = normalizeOptions(control.getOptions?.());
  if (fromControl) {
    return fromControl;
  }

  const fromAttribute = normalizeOptions(control.getAttribute?.()?.getOptions?.());
  return fromAttribute ?? [];
}
