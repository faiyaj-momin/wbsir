import { useLanguage } from '@/context/LanguageContext';
import type { FormStep } from '@/types/form';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: FormStep;
}

const steps = [
  { step: 1, label: 'Basic', labelBn: 'মূল' },
  { step: 2, label: 'Cases', labelBn: 'কেস' },
  { step: 3, label: 'Details', labelBn: 'বিস্তারিত' },
  { step: 4, label: 'Facts', labelBn: 'তথ্য' },
  { step: 5, label: 'Preview', labelBn: 'প্রিভিউ' }
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between">
        {steps.map((s, index) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div key={s.step} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                    text-xs sm:text-sm font-semibold transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    s.step
                  )}
                </div>
                <span className={`
                  text-[10px] sm:text-xs mt-1 font-medium
                  ${isCurrent ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  {t(s.label, s.labelBn)}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="w-4 sm:w-8 mx-1">
                  <div
                    className={`
                      h-0.5 transition-all duration-300
                      ${currentStep > s.step ? 'bg-green-500' : 'bg-muted'}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}