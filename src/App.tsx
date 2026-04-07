import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageProvider } from '@/context/LanguageContext';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from '@/hooks/useForm';
import { StepIndicator } from '@/components/StepIndicator';
import { StepNavigation } from '@/components/StepNavigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { BeforeUnloadWarning } from '@/components/BeforeUnloadWarning';
import { Step1BasicDetails } from '@/components/steps/Step1BasicDetails';
import { Step2CaseSelection } from '@/components/steps/Step2CaseSelection';
import { Step3DynamicFields } from '@/components/steps/Step3DynamicFields';
import { Step4AdditionalFacts } from '@/components/steps/Step4AdditionalFacts';
import { Step5Preview } from '@/components/steps/Step5Preview';
import { FileText, CheckCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';

function FormWizard() {
  const { t } = useLanguage();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const {
    formData,
    currentStep,
    isLoaded,
    updateBasicDetails,
    toggleCase,
    updateDynamicFields,
    updateAdditionalFacts,
    nextStep,
    prevStep,
    resetForm,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid
  } = useForm();

  // Determine if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      case 4:
        return true; // Optional step
      case 5:
        return true; // Preview step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 5) {
      setShowSuccessDialog(true);
    } else {
      nextStep();
    }
  };

  const handleReset = () => {
    if (confirm(t('Are you sure you want to reset all data?', 'আপনি কি নিশ্চিত যে সমস্ত ডেটা রিসেট করতে চান?'))) {
      resetForm();
    }
  };

  const handleFinish = () => {
    setShowSuccessDialog(false);
    resetForm();
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicDetails
            data={formData.basicDetails}
            onUpdate={updateBasicDetails}
          />
        );
      case 2:
        return (
          <Step2CaseSelection
            selectedCases={formData.selectedCases}
            onToggleCase={toggleCase}
          />
        );
      case 3:
        return (
          <Step3DynamicFields
            formData={formData}
            onUpdate={updateDynamicFields}
          />
        );
      case 4:
        return (
          <Step4AdditionalFacts
            value={formData.additionalFacts}
            onChange={updateAdditionalFacts}
          />
        );
      case 5:
        return (
          <Step5Preview
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <BeforeUnloadWarning />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{t('Form Wizard', 'ফর্ম উইজার্ড')}</h1>
              <p className="text-xs text-muted-foreground">{t('Multi-step Application', 'বহু-ধাপ আবেদন')}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-0">
            <StepIndicator currentStep={currentStep} />
          </CardHeader>
          <CardContent className="pt-6">
            {renderStepContent()}
            
            <div className="mt-8">
              <StepNavigation
                currentStep={currentStep}
                onPrev={prevStep}
                onNext={handleNext}
                onReset={handleReset}
                canProceed={isCurrentStepValid()}
                isLastStep={currentStep === 5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress Info */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('Step', 'ধাপ')} {currentStep} {t('of', 'এর')} 5
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              {t('Application Submitted!', 'আবেদন জমা হয়েছে!')}
            </DialogTitle>
            <DialogDescription className="pt-4">
              {t(
                'Your application has been successfully submitted. You will receive a confirmation shortly.',
                'আপনার আবেদন সফলভাবে জমা হয়েছে। আপনি শীঘ্রই একটি নিশ্চিতকরণ পাবেন।'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={handleFinish} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {t('Start New Application', 'নতুন আবেদন শুরু করুন')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <FormWizard />
      <Toaster position="top-center" richColors />
    </LanguageProvider>
  );
}

export default App;
