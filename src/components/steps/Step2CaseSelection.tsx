import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { CASES } from '@/types/form';
import type { CaseType } from '@/types/form';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Step2CaseSelectionProps {
  selectedCases: CaseType[];
  onToggleCase: (caseId: CaseType) => void;
}

export function Step2CaseSelection({ selectedCases, onToggleCase }: Step2CaseSelectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('Select Applicable Cases', 'প্রযোজ্য কেস নির্বাচন করুন')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('Select all cases that apply to your situation', 'আপনার পরিস্থিতিতে প্রযোজ্য সব কেস নির্বাচন করুন')}
      </p>

      <TooltipProvider>
        <div className="space-y-3">
          {CASES.map((caseItem) => (
            <div
              key={caseItem.id}
              className={`
                flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer
                ${selectedCases.includes(caseItem.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => onToggleCase(caseItem.id)}
            >
              <Checkbox
                id={caseItem.id}
                checked={selectedCases.includes(caseItem.id)}
                onCheckedChange={() => onToggleCase(caseItem.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={caseItem.id}
                    className="font-medium cursor-pointer"
                  >
                    {language === 'en' ? caseItem.label : caseItem.labelBn}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p>{language === 'en' ? caseItem.description : caseItem.descriptionBn}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>

      {selectedCases.length === 0 && (
        <p className="text-sm text-amber-600">
          {t('Please select at least one case to proceed', 'অগ্রসর হতে কমপক্ষে একটি কেস নির্বাচন করুন')}
        </p>
      )}
    </div>
  );
}
