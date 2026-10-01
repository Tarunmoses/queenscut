export interface MeasurementField {
  key: string;
  label: string;
  placeholder: string;
}

// Field set and placeholders match the locked AddItem mockup exactly
// (inches, "fill what applies" — not every apparel type needs every field).
export const UPPER_BODY_FIELDS: MeasurementField[] = [
  { key: 'shoulder', label: 'Shoulder', placeholder: '14' },
  { key: 'frontNeckDepth', label: 'Front Neck Depth', placeholder: '7' },
  { key: 'backNeckDepth', label: 'Back Neck Depth', placeholder: '8' },
  { key: 'bust', label: 'Bust / Chest', placeholder: '36' },
  { key: 'armhole', label: 'Armhole', placeholder: '16' },
  { key: 'sleeveLength', label: 'Sleeve Length', placeholder: '6' },
  { key: 'sleeveRound', label: 'Sleeve Round', placeholder: '12' },
  { key: 'topLength', label: 'Top / Blouse Length', placeholder: '15' },
];

export const LOWER_BODY_FIELDS: MeasurementField[] = [
  { key: 'waist', label: 'Waist', placeholder: '30' },
  { key: 'hip', label: 'Hip', placeholder: '38' },
  { key: 'thigh', label: 'Thigh', placeholder: '22' },
  { key: 'fullLength', label: 'Full Length', placeholder: '40' },
];

export const APPAREL_TYPES = [
  'Blouse',
  'Lehenga',
  'Gown',
  'Kurti',
  'Dupatta',
  'One-piece',
  'Churidar / Pant',
];
