export interface QuoteIntroForm {
  [index: string]: PromptedNumberInputObject;
}

export interface PromptedNumberInputObject {
  prompt: string;
  units: string;
  initVal: number;
}
