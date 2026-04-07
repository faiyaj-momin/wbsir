import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/context/LanguageContext';
import type { FormData } from '@/types/form';

interface Step1BasicDetailsProps {
  data: FormData['basicDetails'];
  onUpdate: (updates: Partial<FormData['basicDetails']>) => void;
}

export function Step1BasicDetails({ data, onUpdate }: Step1BasicDetailsProps) {
  const { t } = useLanguage();

  const fields = [
    { key: 'fullName', label: 'Full Name', labelBn: 'পূর্ণ নাম', type: 'text', required: true },
    { key: 'fatherName', label: "Father's Name", labelBn: 'পিতার নাম', type: 'text', required: true },
    { key: 'motherName', label: "Mother's Name", labelBn: 'মাতার নাম', type: 'text', required: true },
    { key: 'spouseName', label: "Spouse Name", labelBn: 'স্বামী/স্ত্রীর নাম', type: 'text', required: false },
    { key: 'gender', label: 'Gender', labelBn: 'লিঙ্গ', type: 'radio', required: false },
    { key: 'dateOfBirth', label: 'Date of Birth', labelBn: 'জন্ম তারিখ', type: 'date', required: false },
    { key: 'district', label: 'District', labelBn: 'জেলা', type: 'text', required: false },
    { key: 'address', label: 'Address', labelBn: 'ঠিকানা', type: 'text', required: false }
  ] as const;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('Basic Information', 'মূল তথ্য')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('Please fill in your personal details', 'আপনার ব্যক্তিগত তথ্য পূরণ করুন')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key} className={`space-y-2 ${field.key === 'address' ? 'sm:col-span-2' : ''}`}>
            <Label htmlFor={field.key}>
              {t(field.label, field.labelBn)}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.key === 'gender' ? (
              <RadioGroup
                value={data.gender}
                onValueChange={(value) => onUpdate({ gender: value })}
                className="flex gap-6 h-10 items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem className='font-semibold' value="male" id="male" />
                  <Label htmlFor="male" className="font-normal cursor-pointer">
                    {t('Male', 'পুরুষ')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem className='font-semibold' value="female" id="female" />
                  <Label htmlFor="female" className="font-normal cursor-pointer">
                    {t('Female', 'মহিলা')}
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <Input
                id={field.key}
                type={field.type}
                value={data[field.key as keyof typeof data]}
                onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                placeholder={t(field.label, field.labelBn)}
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
