import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';

interface Step4AdditionalFactsProps {
  value: string;
  onChange: (value: string) => void;
}

export function Step4AdditionalFacts({ value, onChange }: Step4AdditionalFactsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('Additional Facts', 'অতিরিক্ত তথ্য')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('Please provide any additional information that may be relevant to your application', 'আপনার আবেদনের সাথে সম্পর্কিত যেকোনো অতিরিক্ত তথ্য প্রদান করুন')}
      </p>

      <div className="space-y-2">
        <Label htmlFor="additionalFacts">
          {t('Additional Information (Optional)', 'অতিরিক্ত তথ্য (ঐচ্ছিক)')}
        </Label>
        <Textarea
          id="additionalFacts"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t(
            'Enter any additional facts, circumstances, or details that you would like to include in your application...',
            'আপনার আবেদনে অন্তর্ভুক্ত করতে চান এমন যেকোনো অতিরিক্ত তথ্য, পরিস্থিতি বা বিবরণ লিখুন...'
          )}
          className="min-h-[200px] resize-none"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>{t('Character count:', 'অক্ষর সংখ্যা:')} {value.length}</p>
      </div>
    </div>
  );
}
