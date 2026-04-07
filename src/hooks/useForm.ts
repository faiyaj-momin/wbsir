import { useState, useEffect, useCallback } from 'react';
import { emptyFormData } from '@/types/form';
import type { FormData, FormStep, CaseType } from '@/types/form';

const STORAGE_KEY = 'multi-step-form-data';

export function useForm() {
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || emptyFormData);
        setCurrentStep(parsed.currentStep || 1);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData,
        currentStep
      }));
    }
  }, [formData, currentStep, isLoaded]);

  const updateBasicDetails = useCallback((updates: Partial<FormData['basicDetails']>) => {
    setFormData(prev => ({
      ...prev,
      basicDetails: { ...prev.basicDetails, ...updates }
    }));
  }, []);

  const toggleCase = useCallback((caseId: CaseType) => {
    setFormData(prev => {
      const selectedCases = prev.selectedCases.includes(caseId)
        ? prev.selectedCases.filter(c => c !== caseId)
        : [...prev.selectedCases, caseId];

      // Clean up dynamic fields for unselected cases
      const dynamicFields = { ...prev.dynamicFields };
      if (!selectedCases.includes('name_mismatch')) {
        delete dynamicFields.nameMismatch;
      }
      if (!selectedCases.includes('multiple_father')) {
        delete dynamicFields.multipleFather;
      }
      if (!selectedCases.includes('age_over_50')) {
        delete dynamicFields.ageOver50;
      }
      if (!selectedCases.includes('age_under_15')) {
        delete dynamicFields.ageUnder15;
      }

      return { ...prev, selectedCases, dynamicFields };
    });
  }, []);

  const updateDynamicFields = useCallback((updates: Partial<FormData['dynamicFields']>) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, ...updates }
    }));
  }, []);

  const updateAdditionalFacts = useCallback((additionalFacts: string) => {
    setFormData(prev => ({ ...prev, additionalFacts }));
  }, []);

  const goToStep = useCallback((step: FormStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 5) as FormStep);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as FormStep);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(emptyFormData);
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Validation helpers
  const isStep1Valid = useCallback(() => {
    const { fullName, fatherName, motherName, dateOfBirth } = formData.basicDetails;
    return fullName.trim() !== '' &&
      fatherName.trim() !== '' &&
      motherName.trim() !== '' &&
      dateOfBirth !== ''
  }, [formData.basicDetails]);

  const isStep2Valid = useCallback(() => {
    return formData.selectedCases.length > 0;
  }, [formData.selectedCases]);

  const isStep3Valid = useCallback(() => {
    const { selectedCases, dynamicFields } = formData;

    if (selectedCases.includes('name_mismatch')) {
      if (!dynamicFields.nameMismatch?.nameOnDocument?.trim() ||
        !dynamicFields.nameMismatch?.nameOnSIR?.trim()) {
        return false;
      }
    }

    if (selectedCases.includes('multiple_father')) {
      if (dynamicFields.multipleFather?.brothersCount === undefined ||
        dynamicFields.multipleFather?.sistersCount === undefined) {
        return false;
      }
    }

    if (selectedCases.includes('age_over_50')) {
      if (dynamicFields.ageOver50?.brothersCount === undefined ||
        dynamicFields.ageOver50?.sistersCount === undefined ||
        dynamicFields.ageOver50?.birthPosition === undefined) {
        return false;
      }
    }

    if (selectedCases.includes('age_under_15')) {
      if (dynamicFields.ageUnder15?.brothersCount === undefined ||
        dynamicFields.ageUnder15?.sistersCount === undefined ||
        dynamicFields.ageUnder15?.birthPosition === undefined) {
        return false;
      }
    }

    return true;
  }, [formData]);

  return {
    formData,
    currentStep,
    isLoaded,
    updateBasicDetails,
    toggleCase,
    updateDynamicFields,
    updateAdditionalFacts,
    goToStep,
    nextStep,
    prevStep,
    resetForm,
    clearStorage,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid
  };
}
