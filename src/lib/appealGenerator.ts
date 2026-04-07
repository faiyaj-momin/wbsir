// Appeal letter generator with predefined templates

export interface BasicDetails {
  name: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  gender: string;
  age: number;
  address: string;
  district: string;
  relation: string;
}

export type CaseType =
  | 'multiple_father'
  | 'name_mismatch'
  | 'age_over_50'
  | 'age_under_15'
  | 'grandparent_mismatch';

export interface DynamicData {
  // Multiple father claim
  totalSiblings?: number;
  brothers?: number;
  sisters?: number;
  parentType?: 'father' | 'mother' | 'other';
  parentName?: string;

  // Name mismatch
  correctName?: string;
  sirName?: string;
  isSelf?: boolean;
  isFather?: boolean;
  // Age over 50 / Under 15
  position?: string | number; // e.g., "eldest", "youngest", 3
  isAgeGapValid?: boolean;
  ageGapType?: 'UNDER_15' | 'OVER_50' | 'NORMAL';
}

export interface AppealInput {
  basic: BasicDetails;
  cases: CaseType[];
  dynamic: DynamicData;
}

function getCurrentDate(): string {
  const date = new Date();
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getParent(basic: BasicDetails, dynamic: DynamicData) {
  const type = dynamic.parentType || "father";

  // Use the name from basic details if possible, fallback to dynamic parentName
  let name = '';
  let label = type === 'other' ? 'parent/guardian' : type;

  if (type === "mother") {
    name = basic.motherName || dynamic.parentName || '';
  } else if (type === "father") {
    name = basic.fatherName || dynamic.parentName || '';
  } else {
    // For "other", we don't have a specific field in basicDetails yet
    // fallback to dynamic.parentName or just 'Parent/Guardian'
    name = dynamic.parentName || 'Parent/Guardian';
  }

  return {
    type,
    name: name || 'Not specified',
    label,
  };
}

function getChildPosition(position: string | number | undefined): string {
  if (!position) return "child";
  if (typeof position === 'string') return position;

  const pos = Number(position);
  if (isNaN(pos)) return "child";

  if (pos === 1) return "eldest";

  const j = pos % 10, k = pos % 100;
  if (j === 1 && k !== 11) return pos + "st";
  if (j === 2 && k !== 12) return pos + "nd";
  if (j === 3 && k !== 13) return pos + "rd";
  return pos + "th";
}

function generateBaseHeader(basic: BasicDetails, dynamic?: DynamicData): string {
  const spouseInfo = basic.spouseName ? `Spouse of ${basic.spouseName.toUpperCase()}\n` : '';
  const parent = dynamic ? getParent(basic, dynamic) : { name: basic.fatherName, label: 'father' };

  return `BEFORE THE LD. TRIBUNAL / APPELLATE COURT AT ${basic.district.toUpperCase()}

Applicant Details:
${basic.name.toUpperCase()}
${basic.relation} of ${parent.name.toUpperCase()}
${spouseInfo}Aged about ${basic.age} years
Resident of ${basic.address.toUpperCase()}
  `.trim();
}

const templates: Record<CaseType, (basic: BasicDetails, dynamic: DynamicData) => string> = {
  multiple_father: (basic, dynamic) => {
    const parent = getParent(basic, dynamic);
    const total = dynamic.totalSiblings || (dynamic.brothers || 0) + (dynamic.sisters || 0);
    return `${generateBaseHeader(basic, dynamic)}

Respected Sir/Madam,

I received a notice from the BLO regarding wrong linkage during SIR 2026 verification.

It has been stated that multiple persons are linked to the same ${parent.label}, creating suspicion of incorrect association. In this regard, I respectfully submit that my ${parent.label}’s name is ${parent.name}, and my relationship details are true and correctly recorded.

We are a total of ${total} siblings—${dynamic.brothers || 0} brothers and ${dynamic.sisters || 0} sisters—and all of us are the biological children of ${parent.name}.

The confusion appears to have arisen due to similarity of names or clerical/data-entry errors in electoral records.

Therefore, I humbly request that the records may kindly be verified and the correct linkage be maintained.

Thanking you.

${basic.name.toUpperCase()}
Date: ${getCurrentDate()}`;
  },

  name_mismatch: (basic, dynamic) => {
    const parent = getParent(basic, dynamic);
    const subject = dynamic.isSelf ? 'my' : `my ${parent.label}’s`;

    return `${generateBaseHeader(basic, dynamic)}

Respected Sir/Madam,

I received a notice from the BLO regarding discrepancy in ${subject} name during SIR 2026 verification.

It is observed that ${subject} name appears differently in earlier electoral records compared to the present record. In this regard, I respectfully submit that both names refer to the same person.

The variation appears to be due to spelling differences, phonetic variations, or clerical errors during data entry in legacy records.

There has been no change in identity, and the relationship remains correct and consistent.

Therefore, I humbly request that the records may kindly be verified and the correct name linkage be maintained.

Thanking you.

${basic.name.toUpperCase()}
Date: ${getCurrentDate()}`;
  },

  age_over_50: (basic, dynamic) => {
    const parent = getParent(basic, dynamic);
    const positionText = getChildPosition(dynamic.position);
    const total = dynamic.totalSiblings || (dynamic.brothers || 0) + (dynamic.sisters || 0) || 1;
    const isValid = dynamic.isAgeGapValid !== false; // Default to true if not specified

    let content = '';
    if (isValid) {
      content = `
It has been stated that there is a significant age gap between me and my ${parent.label}.

In this regard, I respectfully submit that the said age difference is genuine and factually correct.

My ${parent.label}'s name is ${parent.name}, and my relationship details are true and correctly recorded.

We are a total of ${total} siblings—${dynamic.brothers || 0} brothers and ${dynamic.sisters || 0} sisters—and I am the ${positionText} in the family.

Such variation in age has naturally occurred due to extended family structure and birth span. It is also submitted that in earlier times, particularly in rural and traditional Indian society, marriages often took place at a younger age, contributing to such age differences.

Therefore, this is not a case of wrong linkage, and my relationship details are true and valid.
`.trim();
    } else {
      content = `
It has been stated in the BLO notice that there exists a significant age gap between me and my ${parent.label}.

In this regard, I respectfully submit that the said observation is incorrect and not supported by actual records.

My ${parent.label}'s name is ${parent.name}, and there is no such abnormal age difference between us.

I am the ${positionText} in a family of ${total} siblings, and the discrepancy appears to have arisen due to clerical or verification error during the SIR process.

Therefore, I humbly request that the records may kindly be re-verified and corrected accordingly.
`.trim();
    }

    return `${generateBaseHeader(basic, dynamic)}

Respected Sir/Madam,

I received a notice from the BLO regarding age difference observed during SIR 2026 verification.

${content}

Thanking you.

${basic.name.toUpperCase()}
Date: ${getCurrentDate()}`;
  },

  age_under_15: (basic, dynamic) => {
    const parent = getParent(basic, dynamic);
    const positionText = getChildPosition(dynamic.position);
    const total = dynamic.totalSiblings || (dynamic.brothers || 0) + (dynamic.sisters || 0) || 1;
    const isValid = dynamic.isAgeGapValid !== false;

    let content = '';
    if (isValid) {
      content = `
It has been stated that there is a relatively small age gap between me and my ${parent.label}.

In this regard, I respectfully submit that the said age difference is genuine and factually correct.

My ${parent.label}'s name is ${parent.name}, and my relationship details are true and correctly recorded.

We are a total of ${total} siblings—${dynamic.brothers || 0} brothers and ${dynamic.sisters || 0} sisters—and I am the ${positionText} in the family.

Such variation in age has naturally occurred due to extended family structure and birth span.

Therefore, this is not a case of wrong linkage, and my relationship details are true and valid.
`.trim();
    } else {
      content = `
It has been stated in the BLO notice that there exists a small age gap between me and my ${parent.label}.

In this regard, I respectfully submit that the said observation is incorrect and not supported by actual records.

My ${parent.label}'s name is ${parent.name}, and there is no such abnormal age difference between us.

I am the ${positionText} in a family of ${total} siblings, and the discrepancy appears to have arisen due to clerical or verification error during the SIR process.

Therefore, I humbly request that the records may kindly be re-verified and corrected accordingly.
`.trim();
    }

    return `${generateBaseHeader(basic, dynamic)}

Respected Sir/Madam,

I received a notice from the BLO regarding age difference observed during SIR 2026 verification.

${content}

Thanking you.

${basic.name.toUpperCase()}
Date: ${getCurrentDate()}`;
  },

  grandparent_mismatch: (basic, dynamic) => {
    return `${generateBaseHeader(basic, dynamic)}

Respected Sir/Madam,

I received a notice from the BLO regarding grandparent information mismatch in the records.

I respectfully submit that the grandparent details provided by me are accurate and reflect my true ancestral linkage. The discrepancy noted may be due to record variation, spelling differences, or clerical error in the database systems.

I request you to kindly verify the archival records and correct the same to ensure my lineage is correctly established.

Thanking you,

${basic.name.toUpperCase()}
Date: ${getCurrentDate()}`;
  }
};

export function generateAppeal(data: AppealInput): string {
  const { basic, cases, dynamic } = data;

  // Handle multiple cases
  if (cases.length > 1) {
    return "Multiple case support will be available soon. Please select one case.";
  }

  // Handle no cases
  if (cases.length === 0) {
    return "Please select at least one case to generate the appeal.";
  }

  const selectedCase = cases[0];
  const template = templates[selectedCase];

  if (!template) {
    return "Invalid case selected.";
  }

  return template(basic, dynamic);
}

// Helper function to map form data to appeal input format
export function mapFormDataToAppealInput(
  basicDetails: {
    fullName: string;
    fatherName: string;
    motherName: string;
    spouseName: string;
    gender: string;
    dateOfBirth: string;
    address: string;
    district: string;
  },
  selectedCases: CaseType[],
  dynamicFields: {
    nameMismatch?: { nameOnDocument: string; nameOnSIR: string, isSelf?: boolean, isFather?: boolean };
    multipleFather?: { brothersCount: number; sistersCount: number, parentType?: 'father' | 'mother' | 'other' };
    ageOver50?: { brothersCount: number; sistersCount: number; birthPosition: number, parentType?: 'father' | 'mother' | 'other', ageDifference?: number };
    ageUnder15?: { brothersCount: number; sistersCount: number; birthPosition: number, parentType?: 'father' | 'mother' | 'other', ageDifference?: number };
  },
  relationOverride: string = ''
): AppealInput {
  // Calculate age from date of birth
  const dob = new Date(basicDetails.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // Determine relation based on gender if not overridden
  let relation = relationOverride;
  if (!relation) {
    const gender = (basicDetails.gender || '').toLowerCase();
    if (gender === 'female' || gender === 'f' || gender === 'মহিলা' || gender === 'মেয়ে') {
      relation = 'Daughter';
    } else {
      relation = 'Son';
    }
  }

  // Map dynamic fields
  const dynamic: DynamicData = {};

  if (dynamicFields.nameMismatch) {
    dynamic.correctName = dynamicFields.nameMismatch.nameOnDocument;
    dynamic.sirName = dynamicFields.nameMismatch.nameOnSIR;
    dynamic.isSelf = dynamicFields.nameMismatch.isSelf;
    dynamic.isFather = dynamicFields.nameMismatch.isFather;
    dynamic.parentType = 'father'; // Default to father for name mismatch unless specified otherwise
  }

  if (dynamicFields.multipleFather) {
    dynamic.brothers = dynamicFields.multipleFather.brothersCount;
    dynamic.sisters = dynamicFields.multipleFather.sistersCount;
    dynamic.totalSiblings = (dynamic.brothers || 0) + (dynamic.sisters || 0);
    dynamic.parentType = dynamicFields.multipleFather.parentType || 'father';
    dynamic.parentName = dynamic.parentType === 'mother' ? basicDetails.motherName : basicDetails.fatherName;
  }

  if (dynamicFields.ageOver50) {
    dynamic.brothers = dynamicFields.ageOver50.brothersCount;
    dynamic.sisters = dynamicFields.ageOver50.sistersCount;
    dynamic.totalSiblings = (dynamic.brothers || 0) + (dynamic.sisters || 0);
    dynamic.position = dynamicFields.ageOver50.birthPosition;
    dynamic.parentType = dynamicFields.ageOver50.parentType || 'father';
    dynamic.ageGapType = 'OVER_50';
    dynamic.isAgeGapValid = true;
  }

  if (dynamicFields.ageUnder15) {
    dynamic.brothers = dynamicFields.ageUnder15.brothersCount;
    dynamic.sisters = dynamicFields.ageUnder15.sistersCount;
    dynamic.totalSiblings = (dynamic.brothers || 0) + (dynamic.sisters || 0);
    dynamic.position = dynamicFields.ageUnder15.birthPosition;
    dynamic.parentType = dynamicFields.ageUnder15.parentType || 'father';
    dynamic.ageGapType = 'UNDER_15';
    dynamic.isAgeGapValid = true;
  }

  return {
    basic: {
      name: basicDetails.fullName,
      fatherName: basicDetails.fatherName,
      motherName: basicDetails.motherName,
      spouseName: basicDetails.spouseName,
      gender: basicDetails.gender,
      age: age || 25,
      address: basicDetails.address,
      district: basicDetails.district || 'MALDA',
      relation
    },
    cases: selectedCases,
    dynamic
  };
}
