export interface QuoteIntroForm {
  [index: string]: PromptedNumberInputObject;
}

export interface PromptedNumberInputObject {
  prompt: string;
  units: string;
  value: number;
}

export interface BackNextButtonConfig {
  nextText: string;
  backText: string;
  showBack: boolean;
  showNext: boolean;
}

export interface FormSteps {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
  instance: string; //TODO : component
  nextButtonText?: string; // excluded means don't show
  backButtonText?: string; // excluded means don't show
}
