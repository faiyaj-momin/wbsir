import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { FormStep } from '@/types/form';

interface StepNavigationProps {
  currentStep: FormStep;
  onPrev: () => void;
  onNext: () => void;
  onReset?: () => void;
  canProceed: boolean;
  isLastStep?: boolean;
}

export function StepNavigation({
  currentStep,
  onPrev,
  onNext,
  onReset,
  canProceed,
  isLastStep = false
}: StepNavigationProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div>
        {currentStep === 1 && onReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('Reset', 'রিসেট')}
          </Button>
        )}
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('Previous', 'পূর্ববর্তী')}
          </Button>
        )}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className="flex items-center"
      >
        {isLastStep ? t('Finish', 'শেষ') : t('Next', 'পরবর্তী')}
        {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
}
