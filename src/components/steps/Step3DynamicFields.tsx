import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import type { FormData, MultipleFatherDetails } from '@/types/form';
import { User, Users, Calendar } from 'lucide-react';

interface Step3DynamicFieldsProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData['dynamicFields']>) => void;
}

export function Step3DynamicFields({ formData, onUpdate }: Step3DynamicFieldsProps) {
  const { selectedCases, dynamicFields } = formData;
  const { t } = useLanguage();

  const calculateAgeDiff = (parentDoB: string, applicantDoB: string) => {
    if (!parentDoB || !applicantDoB) return 0;
    const pDate = new Date(parentDoB);
    const aDate = new Date(applicantDoB);
    let diff = aDate.getFullYear() - pDate.getFullYear();
    const mDiff = aDate.getMonth() - pDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && aDate.getDate() < pDate.getDate())) {
      diff--;
    }
    return diff;
  };

  const hasNameMismatch = selectedCases.includes('name_mismatch');
  const hasMultipleFather = selectedCases.includes('multiple_father');
  const hasAgeOver50 = selectedCases.includes('age_over_50');
  const hasAgeUnder15 = selectedCases.includes('age_under_15');

  if (!hasNameMismatch && !hasMultipleFather && !hasAgeOver50 && !hasAgeUnder15) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {t('Additional Details', 'অতিরিক্ত বিবরণ')}
        </h2>
        <p className="text-muted-foreground">
          {t('No additional details required for the selected cases.', 'নির্বাচিত কেসগুলির জন্য কোনো অতিরিক্ত বিবরণ প্রয়োজন নেই।')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {t('Additional Details', 'অতিরিক্ত বিবরণ')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('Please provide additional information based on your selected cases', 'আপনার নির্বাচিত কেসের ভিত্তিতে অতিরিক্ত তথ্য প্রদান করুন')}
      </p>

      {/* Name Mismatch Section */}
      {hasNameMismatch && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            <h3 className="font-medium">{t('Name Mismatch Details', 'নামের অমিলের বিবরণ')}</h3>
          </div>

          <div className="flex flex-wrap gap-6 items-center py-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSelf"
                checked={dynamicFields.nameMismatch?.isSelf || false}
                onCheckedChange={(checked) => {
                  onUpdate({
                    nameMismatch: {
                      ...dynamicFields.nameMismatch,
                      nameOnDocument: dynamicFields.nameMismatch?.nameOnDocument || '',
                      nameOnSIR: dynamicFields.nameMismatch?.nameOnSIR || '',
                      isSelf: checked === true
                    }
                  });
                }}
              />
              <Label htmlFor="isSelf" className="cursor-pointer">
                {t('Self', 'নিজ')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFather"
                checked={dynamicFields.nameMismatch?.isFather || false}
                onCheckedChange={(checked) => {
                  onUpdate({
                    nameMismatch: {
                      ...dynamicFields.nameMismatch,
                      nameOnDocument: dynamicFields.nameMismatch?.nameOnDocument || '',
                      nameOnSIR: dynamicFields.nameMismatch?.nameOnSIR || '',
                      isFather: checked === true
                    }
                  });
                }}
              />
              <Label htmlFor="isFather" className="cursor-pointer">
                {t('Father', 'পিতা')}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameOnDocument">
                {t('Name on Document', 'নথিতে নাম')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="nameOnDocument"
                value={dynamicFields.nameMismatch?.nameOnDocument || ''}
                onChange={(e) => {
                  onUpdate({
                    nameMismatch: {
                      ...dynamicFields.nameMismatch,
                      nameOnSIR: dynamicFields.nameMismatch?.nameOnSIR || '',
                      nameOnDocument: e.target.value
                    }
                  });
                }}
                placeholder={t('Enter name as on SIR 2002', '2002 List অনুযায়ী নাম লিখুন')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameOnSIR">
                {t('Name on SIR 2002', 'এস. আই. আর (SIR) 2002 এ নাম')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="nameOnSIR"
                value={dynamicFields.nameMismatch?.nameOnSIR || ''}
                onChange={(e) => {
                  onUpdate({
                    nameMismatch: {
                      ...dynamicFields.nameMismatch,
                      nameOnDocument: dynamicFields.nameMismatch?.nameOnDocument || '',
                      nameOnSIR: e.target.value
                    }
                  });
                }}
                placeholder={t('Enter name as on SIR', 'এসআইআর অনুযায়ী নাম লিখুন')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multiple Father Section */}
      {hasMultipleFather && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5" />
            <h3 className="font-medium">{t('Siblings Information', 'ভাইবোনের তথ্য')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentType-multiple">
                {t('Select Parent', 'পিতা/মাতা নির্বাচন করুন')}
              </Label>
              <select
                id="parentType-multiple"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={dynamicFields.multipleFather?.parentType || 'father'}
                onChange={(e) => {
                  const current: MultipleFatherDetails = dynamicFields.multipleFather || { brothersCount: 0, sistersCount: 0 };
                  onUpdate({
                    multipleFather: {
                      ...current,
                      parentType: e.target.value as any
                    }
                  });
                }}
              >
                <option value="father">{t('Father', 'পিতা')}</option>
                <option value="mother">{t('Mother', 'মাতা')}</option>
                <option value="other">{t('Other', 'অন্যান্য')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brothersCount">
                {t('Number of Brothers', 'ভাইয়ের সংখ্যা')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="brothersCount"
                type="number"
                min="0"
                value={dynamicFields.multipleFather?.brothersCount ?? ''}
                onChange={(e) => {
                  const current: MultipleFatherDetails = dynamicFields.multipleFather || { brothersCount: 0, sistersCount: 0 };
                  onUpdate({
                    multipleFather: {
                      ...current,
                      brothersCount: parseInt(e.target.value) || 0
                    }
                  });
                }}
                placeholder={t('Enter number of brothers', 'ভাইয়ের সংখ্যা লিখুন')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sistersCount">
                {t('Number of Sisters', 'বোনের সংখ্যা')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="sistersCount"
                type="number"
                min="0"
                value={dynamicFields.multipleFather?.sistersCount ?? ''}
                onChange={(e) => {
                  const current: MultipleFatherDetails = dynamicFields.multipleFather || { brothersCount: 0, sistersCount: 0 };
                  onUpdate({
                    multipleFather: {
                      ...current,
                      sistersCount: parseInt(e.target.value) || 0
                    }
                  });
                }}
                placeholder={t('Enter number of sisters', 'বোনের সংখ্যা লিখুন')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Age Over 50 Section */}
      {hasAgeOver50 && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            <h3 className="font-medium">{t('Age > 50 Details', '৫০ বছরের বেশি বয়সের তথ্য')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentType-50">
                {t('Select Parent', 'পিতা/মাতা নির্বাচন করুন')}
              </Label>
              <select
                id="parentType-50"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={dynamicFields.ageOver50?.parentType || 'father'}
                onChange={(e) => {
                  onUpdate({
                    ageOver50: {
                      ...(dynamicFields.ageOver50 || { birthPosition: 1, brothersCount: 0, sistersCount: 0 }),
                      parentType: e.target.value as any
                    }
                  });
                }}
              >
                <option value="father">{t('Father', 'পিতা')}</option>
                <option value="mother">{t('Mother', 'মাতা')}</option>
                <option value="other">{t('Other', 'অন্যান্য')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentDoB-50">
                {t('Parent Date of Birth', 'পিতা/মাতার জন্ম তারিখ')}
              </Label>
              <Input
                id="parentDoB-50"
                type="date"
                value={dynamicFields.ageOver50?.parentDoB || ''}
                onChange={(e) => {
                  const dob = e.target.value;
                  const diff = calculateAgeDiff(dob, formData.basicDetails.dateOfBirth);
                  onUpdate({
                    ageOver50: {
                      ...(dynamicFields.ageOver50 || { birthPosition: 1, brothersCount: 0, sistersCount: 0 }),
                      parentDoB: dob,
                      ageDifference: diff
                    }
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brothersCount-50">
                {t('Number of Brothers', 'ভাইয়ের সংখ্যা')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="brothersCount-50"
                type="number"
                min="0"
                value={dynamicFields.ageOver50?.brothersCount ?? ''}
                onChange={(e) => {
                  onUpdate({
                    ageOver50: {
                      ...(dynamicFields.ageOver50 || { birthPosition: 1, brothersCount: 0, sistersCount: 0 }),
                      brothersCount: parseInt(e.target.value) || 0
                    }
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sistersCount-50">
                {t('Number of Sisters', 'বোনের সংখ্যা')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="sistersCount-50"
                type="number"
                min="0"
                value={dynamicFields.ageOver50?.sistersCount ?? ''}
                onChange={(e) => {
                  onUpdate({
                    ageOver50: {
                      ...(dynamicFields.ageOver50 || { birthPosition: 1, brothersCount: 0, sistersCount: 0 }),
                      sistersCount: parseInt(e.target.value) || 0
                    }
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPosition-50">
                {t('Your Birth Position', 'আপনার জন্ম ক্রম')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="birthPosition-50"
                type="number"
                min="1"
                value={dynamicFields.ageOver50?.birthPosition ?? ''}
                onChange={(e) => {
                  onUpdate({
                    ageOver50: {
                      ...(dynamicFields.ageOver50 || { birthPosition: 1, brothersCount: 0, sistersCount: 0 }),
                      birthPosition: parseInt(e.target.value) || 1
                    }
                  });
                }}
              />
            </div>

            {dynamicFields.ageOver50?.ageDifference !== undefined && (
              <div className="flex items-end pb-3">
                <div className="w-full p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm font-medium">
                    {t('Age Difference:', 'বয়সের পার্থক্য:')} {dynamicFields.ageOver50.ageDifference} {t('years', 'বছর')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Age Under 15 Section */}
      {selectedCases.includes('age_under_15') && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            <h3 className="font-medium">{t('Age < 15 Details', '১৫ বছরের কম বয়সের তথ্য')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentType-15">
                {t('Select Parent', 'পিতা/মাতা নির্বাচন করুন')}
              </Label>
              <select
                id="parentType-15"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={dynamicFields.ageUnder15?.parentType || 'father'}
                onChange={(e) => {
                  onUpdate({
                    ageUnder15: {
                      ...(dynamicFields.ageUnder15 || { brothersCount: 0, sistersCount: 0, birthPosition: 1 }),
                      parentType: e.target.value as any
                    }
                  });
                }}
              >
                <option value="father">{t('Father', 'পিতা')}</option>
                <option value="mother">{t('Mother', 'মাতা')}</option>
                <option value="other">{t('Other', 'অন্যান্য')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentDoB-15">
                {t('Parent Date of Birth', 'পিতা/মাতার জন্ম তারিখ')}
              </Label>
              <Input
                id="parentDoB-15"
                type="date"
                value={dynamicFields.ageUnder15?.parentDoB || ''}
                onChange={(e) => {
                  const dob = e.target.value;
                  const diff = calculateAgeDiff(dob, formData.basicDetails.dateOfBirth);
                  onUpdate({
                    ageUnder15: {
                      ...(dynamicFields.ageUnder15 || { brothersCount: 0, sistersCount: 0, birthPosition: 1 }),
                      parentDoB: dob,
                      ageDifference: diff
                    }
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brothersCount-15">
                {t('Number of Brothers', 'ভাইয়ের সংখ্যা')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="brothersCount-15"
                type="number"
                min="0"
                value={dynamicFields.ageUnder15?.brothersCount ?? ''}
                onChange={(e) => {
                  onUpdate({
                    ageUnder15: {
                      ...(dynamicFields.ageUnder15 || { brothersCount: 0, sistersCount: 0, birthPosition: 1 }),
                      brothersCount: parseInt(e.target.value) || 0
                    }
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sistersCount-15">
                {t('Number of Sisters', 'বোনের সংখ্যা')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="sistersCount-15"
                type="number"
                min="0"
                value={dynamicFields.ageUnder15?.sistersCount ?? ''}
                onChange={(e) => {
                  onUpdate({
                    ageUnder15: {
                      ...(dynamicFields.ageUnder15 || { brothersCount: 0, sistersCount: 0, birthPosition: 1 }),
                      sistersCount: parseInt(e.target.value) || 0
                    }
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPosition-15">
                {t('Your Birth Position', 'আপনার জন্ম ক্রম')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="birthPosition-15"
                type="number"
                min="1"
                value={dynamicFields.ageUnder15?.birthPosition ?? ''}
                onChange={(e) => {
                  onUpdate({
                    ageUnder15: {
                      ...(dynamicFields.ageUnder15 || { brothersCount: 0, sistersCount: 0, birthPosition: 1 }),
                      birthPosition: parseInt(e.target.value) || 1
                    }
                  });
                }}
              />
            </div>

            {dynamicFields.ageUnder15?.ageDifference !== undefined && (
              <div className="flex items-end pb-3">
                <div className="w-full p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm font-medium">
                    {t('Age Difference:', 'বয়সের পার্থক্য:')} {dynamicFields.ageUnder15.ageDifference} {t('years', 'বছর')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
