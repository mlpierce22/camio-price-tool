import { Component } from "vue/types/umd";

export interface QuoteIntroForm {
  [index: string]: PromptedNumberInputObject;
}

export interface PromptedNumberInputObject {
  prompt: string;
  units: string;
  value: number;
}

export interface BackNextButtonConfig {
  nextText?: string;
  backText?: string;
}

export interface ComponentEvents {
  [eventName: string]: Function;
}

// export interface PropList {
//   [propName: string]: QuoteIntroForm | any; // TODO: Add all types here
// }

export interface FormSteps {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
  instance: Component;
  navButtons: BackNextButtonConfig;
  events?: ComponentEvents;
  props?: PropsList;
}

export interface FormPlaceHolder {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
}

export interface FormItem extends AccountForm {
  selectionOptions: any;
}
export interface AccountForm {
  fieldName: string;
  isDefault: boolean;
  formType: string;
  selected: string | Indexing | string[] | Array<AccountSubForm>;
  selectionOpts: string[] | AddOnOpts[] | IndexingOpts[];
}

export interface AccountSubForm {
  fieldName: string;
  advanced: boolean;
  subForm: Array<AccountForm>;
}

export interface Indexing {
  type: string;
  option: string; // could be a number, depends
}

export interface IndexingOpts {
  type: string;
  options: string[]; // could be a number, depends
}

export interface PlanTemplates {
  [key: string]: Array<BasePlanOpts>;
}
export interface BasePlanOpts {
  fieldName: string;
  selected: string | Indexing | string[] | Array<AddOn>;
}

export interface AddOn {
  type: string;
  rate: number;
}

export interface AddOnOpts {
  name: string;
  rate: number[];
}

export interface PagesData {
  [pageName: string]: PropsList;
}

export interface PropsList {
  [prop: string]: any; // TODO: Type for each option of prop
}
