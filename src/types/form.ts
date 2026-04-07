// Form types and interfaces

export type CaseType =
  | 'multiple_father'
  | 'name_mismatch'
  | 'age_over_50'
  | 'age_under_15'
  | 'grandparent_mismatch';

export interface CaseInfo {
  id: CaseType;
  label: string;
  labelBn: string;
  description: string;
  descriptionBn: string;
}

export interface BasicDetails {
  fullName: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  district: string;
}

export interface NameMismatchDetails {
  nameOnDocument: string;
  nameOnSIR: string;
  isSelf?: boolean;
  isFather?: boolean;
}

export interface MultipleFatherDetails {
  brothersCount: number;
  sistersCount: number;
  parentType?: 'father' | 'mother' | 'other';
}

export interface AgeOver50Details {
  brothersCount: number;
  sistersCount: number;
  birthPosition: number;
  parentType?: 'father' | 'mother' | 'other';
  parentDoB?: string;
  ageDifference?: number;
}

export interface AgeUnder15Details {
  brothersCount: number;
  sistersCount: number;
  birthPosition: number;
  parentType?: 'father' | 'mother' | 'other';
  parentDoB?: string;
  ageDifference?: number;
}

export interface DynamicFields {
  nameMismatch?: NameMismatchDetails;
  multipleFather?: MultipleFatherDetails;
  ageOver50?: AgeOver50Details;
  ageUnder15?: AgeUnder15Details;
}

export interface FormData {
  basicDetails: BasicDetails;
  selectedCases: CaseType[];
  dynamicFields: DynamicFields;
  additionalFacts: string;
}

export type FormStep = 1 | 2 | 3 | 4 | 5;

export const CASES: CaseInfo[] = [
  {
    id: 'multiple_father',
    label: 'Multiple Father Claim',
    labelBn: 'একাধিক পিতার দাবি',
    description: 'When there are multiple claims about father identity',
    descriptionBn: 'যখন পিতার পরিচয় নিয়ে একাধিক দাবি থাকে'
  },
  {
    id: 'name_mismatch',
    label: 'Name Mismatch',
    labelBn: 'নামের অমিল',
    description: 'When name on documents differs from NID',
    descriptionBn: 'যখন নথিতে নাম ও জাতীয় পরিচয়পত্রের নাম ভিন্ন হয়'
  },
  {
    id: 'age_over_50',
    label: 'Age > 50',
    labelBn: 'বয়স > ৫০',
    description: 'When applicant age is over 50 years',
    descriptionBn: 'যখন আবেদনকারীর বয়স ৫০ বছরের বেশি'
  },
  {
    id: 'age_under_15',
    label: 'Age < 15',
    labelBn: 'বয়স < ১৫',
    description: 'When applicant age is under 15 years',
    descriptionBn: 'যখন আবেদনকারীর বয়স ১৫ বছরের কম'
  },
  {
    id: 'grandparent_mismatch',
    label: 'Grandparent Mismatch',
    labelBn: 'দাদা-দাদির অমিল',
    description: 'When grandparent information does not match',
    descriptionBn: 'যখন দাদা-দাদির তথ্য মিলে না'
  }
];

export const emptyFormData: FormData = {
  basicDetails: {
    fullName: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    district: '',
  },
  selectedCases: [],
  dynamicFields: {},
  additionalFacts: ''
};
