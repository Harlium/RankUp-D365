// Parameters passed to Xrm.Navigation.openForm when cloning a record.
// System columns such as modifiedonbehalfby are not valid create parameters.
// On-premises (and some online shells) reject the generated
// `modifiedonbehalfbytype` query key. Lookup name/type pairs are still emitted
// for columns that are actually cloned, because openForm requires them.

export interface CloneAttributeInput {
  name: string;
  type?: string | null;
  value: unknown;
  /** When false, the user cannot create this column. Undefined means unknown. */
  canCreate?: boolean;
}

interface LookupValue {
  id?: string;
  name?: string;
  entityType?: string;
}

const CLONABLE_TYPES = new Set([
  'string',
  'memo',
  'integer',
  'double',
  'decimal',
  'money',
  'boolean',
  'datetime',
  'optionset',
  'multiselectoptionset',
  'lookup',
]);

/** Columns that are not valid values on a new record. */
export const NON_CLONABLE_ATTRIBUTE_NAMES = new Set([
  'createdon',
  'modifiedon',
  'createdby',
  'modifiedby',
  'createdonbehalfby',
  'modifiedonbehalfby',
  'ownerid',
  'owningbusinessunit',
  'owninguser',
  'owningteam',
  'versionnumber',
  'timezoneruleversionnumber',
  'utcconversiontimezonecode',
  'importsequencenumber',
  'overriddencreatedon',
  'statecode',
  'statuscode',
  'processid',
  'stageid',
  'traversedpath',
  'exchangerate',
  'entityimage',
  'entityimageid',
  'entityimage_url',
  'entityimage_timestamp',
]);

export function isClonableAttribute(attribute: CloneAttributeInput): boolean {
  const name = attribute.name?.toLowerCase();
  if (!name || NON_CLONABLE_ATTRIBUTE_NAMES.has(name)) {
    return false;
  }
  if (attribute.canCreate === false) {
    return false;
  }

  const type = attribute.type?.toLowerCase();
  if (!type || !CLONABLE_TYPES.has(type)) {
    return false;
  }

  return true;
}

function isLookupValue(value: unknown): value is LookupValue[] {
  return (
    Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null
  );
}

/**
 * Build openForm parameters. Falsy values are skipped, matching the previous
 * clone behavior (including boolean false and numeric 0).
 */
export function buildCloneParameters(
  attributes: readonly CloneAttributeInput[]
): Record<string, string> {
  const parameters: Record<string, string> = {};

  for (const attribute of attributes) {
    if (!isClonableAttribute(attribute) || !attribute.value) {
      continue;
    }

    if (attribute.type?.toLowerCase() === 'lookup' && isLookupValue(attribute.value)) {
      const lookup = attribute.value[0];
      if (!lookup.id) {
        continue;
      }
      parameters[attribute.name] = lookup.id;
      if (lookup.name) {
        parameters[`${attribute.name}name`] = lookup.name;
      }
      if (lookup.entityType) {
        parameters[`${attribute.name}type`] = lookup.entityType;
      }
      continue;
    }

    parameters[attribute.name] = String(attribute.value);
  }

  return parameters;
}
