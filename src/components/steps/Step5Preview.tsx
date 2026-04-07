import { useLanguage } from '@/context/LanguageContext';
import { CASES } from '@/types/form';
import type { FormData } from '@/types/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, FileText, Users, Calendar, AlertCircle, CheckCircle, Download, Copy, Sparkles } from 'lucide-react';
import { generateAppeal, mapFormDataToAppealInput, type CaseType } from '@/lib/appealGenerator';
import { generateAppealWithGemini, hasGeminiApiKey } from '@/lib/geminiAppeal';
import { downloadPDF } from '@/lib/pdfDownload';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Step5PreviewProps {
  formData: FormData;
}

export function Step5Preview({ formData }: Step5PreviewProps) {
  const { t, language } = useLanguage();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedAppeal, setGeneratedAppeal] = useState('');
  const [editableAppeal, setEditableAppeal] = useState('');

  const { basicDetails, selectedCases, dynamicFields, additionalFacts } = formData;

  const templateAppealText = useMemo(() => {
    const appealInput = mapFormDataToAppealInput(
      basicDetails,
      selectedCases,
      dynamicFields
    );
    return generateAppeal(appealInput);
  }, [basicDetails, selectedCases, dynamicFields]);

  useEffect(() => {
    setGeneratedAppeal('');
    setEditableAppeal('');
  }, [additionalFacts, basicDetails, dynamicFields, language, selectedCases]);

  const isMultipleCases = selectedCases.length > 1;
  const aiAvailable = hasGeminiApiKey();
  const appealText = editableAppeal || generatedAppeal || (!isMultipleCases ? templateAppealText : '');
  const hasAppealText = appealText.trim().length > 0;

  const getCaseLabel = (caseId: CaseType) => {
    const caseItem = CASES.find(c => c.id === caseId);
    return language === 'en' ? caseItem?.label : caseItem?.labelBn;
  };

  const getCaseIcon = (caseId: CaseType) => {
    switch (caseId) {
      case 'name_mismatch':
        return <User className="w-4 h-4" />;
      case 'multiple_father':
        return <Users className="w-4 h-4" />;
      case 'age_over_50':
      case 'age_under_15':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleDownloadPDF = async () => {
    if (!hasAppealText) {
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await downloadPDF('appeal-preview', {
        filename: `appeal_${basicDetails.fullName.replace(/\s+/g, '_')}.pdf`,
        margin: 15,
        scale: 2
      });
      toast.success(t('PDF Downloaded', 'পিডিএফ ডাউনলোড হয়েছে'), {
        description: t('Your appeal has been downloaded successfully.', 'আপনার আবেদন সফলভাবে ডাউনলোড হয়েছে।'),
      });
    } catch (error) {
      toast.error(t('Download Failed', 'ডাউনলোড ব্যর্থ'), {
        description: t('Failed to generate PDF. Please try again.', 'পিডিএফ তৈরি করতে ব্যর্থ। আবার চেষ্টা করুন।'),
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(appealText);
      toast.success(t('Copied', 'কপি হয়েছে'), {
        description: t('Appeal text copied to clipboard.', 'আবেদনের টেক্সট ক্লিপবোর্ডে কপি হয়েছে।'),
      });
    } catch (error) {
      toast.error(t('Copy Failed', 'কপি ব্যর্থ'), {
        description: t('Failed to copy text.', 'টেক্সট কপি করতে ব্যর্থ।'),
      });
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const draft = await generateAppealWithGemini(formData);
      setGeneratedAppeal(draft);
      setEditableAppeal(draft);
      toast.success(t('AI Draft Ready', 'এআই খসড়া প্রস্তুত'), {
        description: t('Gemini generated your appeal draft.', 'Gemini আপনার আবেদন খসড়া তৈরি করেছে।'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('Unknown error occurred.', 'অজানা ত্রুটি ঘটেছে।');
      toast.error(t('AI Generation Failed', 'এআই খসড়া তৈরি ব্যর্থ'), {
        description: message,
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('Application Preview', 'আবেদন প্রিভিউ')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('Review your generated appeal letter', 'আপনার তৈরি আবেদন পত্র পর্যালোচনা করুন')}
      </p>

      {/* Basic Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('Personal Information', 'ব্যক্তিগত তথ্য')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t('Full Name:', 'পূর্ণ নাম:')}</span>
              <p className="font-medium">{basicDetails.fullName || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('Date of Birth:', 'জন্ম তারিখ:')}</span>
              <p className="font-medium">{basicDetails.dateOfBirth || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("Father's Name:", 'পিতার নাম:')}</span>
              <p className="font-medium">{basicDetails.fatherName || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("Mother's Name:", 'মাতার নাম:')}</span>
              <p className="font-medium">{basicDetails.motherName || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("Spouse Name:", 'স্বামী/স্ত্রীর নাম:')}</span>
              <p className="font-medium">{basicDetails.spouseName || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('Gender:', 'লিঙ্গ:')}</span>
              <p className="font-medium">
                {basicDetails.gender 
                  ? (basicDetails.gender === 'male' ? t('Male', 'পুরুষ') : t('Female', 'মহিলা')) 
                  : '-'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('District:', 'জেলা:')}</span>
              <p className="font-medium">{basicDetails.district || '-'}</p>
            </div>

            {basicDetails.address && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">{t('Address:', 'ঠিকানা:')}</span>
                <p className="font-medium">{basicDetails.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Cases Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('Selected Cases', 'নির্বাচিত কেস')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedCases.map((caseId) => (
              <Badge key={caseId} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {getCaseIcon(caseId as CaseType)}
                {getCaseLabel(caseId as CaseType)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Appeal Letter */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('Generated Appeal Letter', 'তৈরি আবেদন পত্র')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || !aiAvailable}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingAI
                  ? t('Generating AI Draft...', 'এআই খসড়া তৈরি হচ্ছে...')
                  : t('Generate with Gemini', 'Gemini দিয়ে তৈরি করুন')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                disabled={!hasAppealText}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {t('Copy', 'কপি')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || !hasAppealText}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPDF ? t('Generating...', 'তৈরি হচ্ছে...') : t('Download PDF', 'পিডিএফ ডাউনলোড')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!aiAvailable ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium">
                {t(
                  'Gemini API key is not configured. Add your key in local env to enable AI drafting.',
                  'Gemini API key সেট করা নেই। এআই খসড়া চালু করতে local env-এ key যোগ করুন।'
                )}
              </p>
            </div>
          ) : !hasAppealText ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium">
                {t(
                  'Generate with Gemini to create a combined appeal draft for the selected cases.',
                  'নির্বাচিত কেসগুলোর জন্য একত্রিত আবেদন খসড়া তৈরি করতে Gemini ব্যবহার করুন।'
                )}
              </p>
            </div>
          ) : null}

          <div className="relative">
            {/* The editable UI version for the user */}
            <div
              className="p-6 md:p-8 bg-white text-black font-serif text-sm md:text-base leading-relaxed border rounded-lg"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <Textarea
                value={appealText}
                onChange={(event) => setEditableAppeal(event.target.value)}
                className="min-h-[520px] resize-y border-0 p-0 shadow-none focus-visible:ring-0 whitespace-pre-wrap"
              />
            </div>

            {/* The hidden printable version for PDF generation - positioned off-screen */}
            <div
              id="appeal-preview"
              className="fixed -left-[9999px] top-0 bg-white text-black font-serif text-base leading-relaxed whitespace-pre-wrap p-12 w-[800px]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {appealText}
            </div>
          </div>
          {!isMultipleCases && !generatedAppeal && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t(
                'The existing template draft is shown by default. Use Gemini to rewrite or improve it.',
                'ডিফল্টভাবে বিদ্যমান template draft দেখানো হচ্ছে। Gemini দিয়ে এটিকে নতুন করে লিখতে বা উন্নত করতে পারেন।'
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {hasAppealText && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">
              {t('Your appeal letter is ready!', 'আপনার আবেদন পত্র প্রস্তুত!')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
