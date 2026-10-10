// The three static Sigma(648) fields the colour gates are proven on (decision 012 point 4, decision 013 point 2):
// identity links, R*'s own lifted hash (section 'first'), and its site-wise gauge transform at offset 1.

import { gaugeField, identityField, ruleField, type ColorField } from '@/code/measure/color-gates'

export const GATE_FIELDS: Record<'cf' | 'cr' | 'cg', ColorField> = {
  cf: identityField,
  cr: ruleField('first'),
  cg: gaugeField(ruleField('first'), 1),
}

export type FieldName = keyof typeof GATE_FIELDS
