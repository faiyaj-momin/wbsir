import type { FormData, CaseType } from '@/types/form';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
  };
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const CASE_SUMMARIES: Record<CaseType, string> = {
  multiple_father: 'The applicant has been linked as the child of a father who is also claimed by several other persons, creating doubt about wrong linkage.',
  name_mismatch: 'There is a mismatch in the applicant or parent name between the previous SIR record and other official records.',
  age_over_50: 'The age difference between the applicant and the linked parent is more than 50 years.',
  age_under_15: 'The age difference between the applicant and the linked parent is less than 15 years.',
  grandparent_mismatch: 'The age difference between the applicant and the linked grandparent is less than 40 years.',
};

function getGeminiApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '';
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 0;
}

function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

function relationLabel(formData: FormData): string {
  const gender = formData.basicDetails.gender.toLowerCase();
  return (gender === 'female' || gender === 'f') ? 'Daughter' : 'Son';
}

function formatCaseDetails(formData: FormData): string {
  const lines: string[] = [];

  formData.selectedCases.forEach((caseId) => {
    const summary = CASE_SUMMARIES[caseId];
    if (!summary) return;

    lines.push(`- ${summary}`);

    if (caseId === 'multiple_father' && formData.dynamicFields.multipleFather) {
      const details = formData.dynamicFields.multipleFather;
      lines.push(`  Details: ${details.brothersCount} brothers, ${details.sistersCount} sisters, total ${details.brothersCount + details.sistersCount} siblings.`);
    }

    if (caseId === 'name_mismatch' && formData.dynamicFields.nameMismatch) {
      const details = formData.dynamicFields.nameMismatch;
      const mismatchPerson = details.isFather ? "father's name" : 'applicant name';
      lines.push(`  Details: mismatch in ${mismatchPerson}, correct name "${details.nameOnDocument}", SIR name "${details.nameOnSIR}".`);
    }

    if (caseId === 'age_over_50' && formData.dynamicFields.ageOver50) {
      const details = formData.dynamicFields.ageOver50;
      lines.push(`  Details: ${details.brothersCount} brothers, ${details.sistersCount} sisters, total ${(details.brothersCount || 0) + (details.sistersCount || 0)} siblings, applicant birth position ${details.birthPosition}.`);
      if (details.ageDifference) {
        lines.push(`  Documented gap: ${details.ageDifference} years between me(applicant) and my parent.`);
      }
    }

    if (caseId === 'age_under_15' && formData.dynamicFields.ageUnder15) {
      const details = formData.dynamicFields.ageUnder15;
      lines.push(`  Details: ${details.brothersCount} brothers, ${details.sistersCount} sisters, total ${(details.brothersCount || 0) + (details.sistersCount || 0)} siblings, applicant birth position ${details.birthPosition}.`);
      if (details.ageDifference) {
        lines.push(`  Documented gap: ${details.ageDifference} years between applicant and parent.`);
      }
    }
  });

  return lines.join('\n');
}

function getCurrentDate(): string {
  const date = new Date();
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function buildPrompt(formData: FormData): string {
  const age = calculateAge(formData.basicDetails.dateOfBirth);
  const selectedCases = formData.selectedCases
    .map((caseId) => CASE_SUMMARIES[caseId])
    .join('\n');

  const basicDetails = [
    `Name: ${formData.basicDetails.fullName || 'Not provided'}`,
    `Father: ${formData.basicDetails.fatherName || 'Not provided'}`,
    `Mother: ${formData.basicDetails.motherName || 'Not provided'}`,
    `Spouse: ${formData.basicDetails.spouseName || 'Not provided'}`,
    `Relation: ${relationLabel(formData)}`,
    `Age: ${age ?? 'Not provided'}`,
    `Date of birth: ${formData.basicDetails.dateOfBirth || 'Not provided'}`,
    `Address: ${formData.basicDetails.address || 'Not provided'}`,
    `District: ${formData.basicDetails.district || 'Not provided'}`,
  ].join('\n');

  const extraFacts = formData.additionalFacts.trim()
    ? formData.additionalFacts.trim()
    : '';

  return `You are an expert legal drafting assistant specializing in Electoral Roll Special Intensive Revision (SIR) 2026 and wrong-linkage appeal applications under the Election Commission of India.

### Core Objective:

Draft a single, coherent, legally appropriate appeal application addressing wrong linkage issues identified during SIR verification.

---

### Strict Instructions:

* Write in formal, clear ENGLISH only.
* Do NOT invent facts. Use only provided inputs.
* If any detail is missing, use neutral phrasing like:
  "details are not available on record" or "as per available information".
* Merge all selected cases into ONE structured application.
* Avoid repetition, duplication, or conflicting statements.
* Maintain legal tone suitable for BLO / ERO / Tribunal submission.
* Keep sentences concise and precise.

---

### Mandatory Context:

* Mention BLO (Booth Level Officer) verification / notice.
* Clearly state "wrong linkage" / "incorrect familial association".
* Reference SIR 2026 process where relevant.

---

### Output Structure (Strictly Follow):

1. **Tribunal Header**
   BEFORE THE LD. TRIBUNAL / APPELLATE AUTHORITY AT [DISTRICT]

2. **Applicant Details**
   Name:
   Relation:
   Age:
   Address:

3. **Subject Line**
   Subject: Appeal Against Wrong Linkage Detected During SIR 2026

4. **Opening Statement**
   "That the applicant most respectfully submits as follows:"

5. **Main Body (Numbered Points)**

   * Point 1: Receipt of BLO notice / SIR verification issue
   * Next Points: Each case merged logically:

     * Father name mismatch
     * Multiple persons linked to same parent
     * Age gap inconsistency
     * Legacy electoral roll discrepancies (e.g., 2002 vs current)
     * Spelling/translation variation
   * Combine related issues into unified points (avoid fragmentation)

6. **Additional Facts**
   (Include only if provided, otherwise omit section)

7. **Justification Paragraph**
   Explain that discrepancies are due to clerical/legacy/data-entry errors, not intentional misrepresentation.

8. **Prayer**
   "It is therefore most humbly prayed that this Hon'ble Authority may kindly verify the records and correct the wrong linkage..."

9. **Verification**
   "I, the applicant above named, do hereby verify that the facts stated above are true and correct to the best of my knowledge and belief."

10. **Closure**
    Date: ${getCurrentDate()}
    Place: [District]
    Applicant Signature
    (Name of Applicant)

---

### Input Data:

#### Applicant Info:

${basicDetails}

#### Case Info:

${selectedCases}

#### Case-Specific Details:

${formatCaseDetails(formData) || 'Not available on record'}

#### Additional Facts:

${extraFacts || 'None'}

---

### Important Logic Rules:

* If multiple siblings (e.g., 8–12 children), mention birth order if available.
* If large age gap (40–60 years), justify with late childbirth or large family structure.
* If name mismatch exists, explain phonetic/regional variation.
* If old voter list differs, refer to "legacy electoral records".
* NEVER accuse authority, always use neutral tone like "appears to be due to clerical discrepancy".

---

Now generate the final application accordingly.
`;
}

function extractText(response: GeminiGenerateContentResponse): string {
  const text = response.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  if (text) return text;
  if (response.promptFeedback?.blockReason) throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
  if (response.error?.message) throw new Error(response.error.message);
  throw new Error('Empty response from Gemini.');
}

export async function generateAppealWithGemini(formData: FormData): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('Gemini API key is not configured.');

  const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(formData) }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  return extractText(data);
}
