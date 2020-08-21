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
  prompt: string;
  subPrompt: string;
  subSubPrompt?: string;
  selected: string | TwoTierSelection | AddOn[];
  selectionOpts: string[] | AddOnOpts[] | TwoTierSelectionOpts;
}

export interface AccountSubForm {
  fieldName: string;
  advanced: boolean;
  subForm: Array<Omit<AccountForm, "subPrompt">>;
}

export interface TwoTierSelection {
  type: string;
  option: string; // could be a number, depends
}

export interface TwoTierSelectionOpts {
  [type: string]: string[];
}

export interface PlanTemplates {
  [key: string]: Array<BasePlanOpts>;
}
export interface BasePlanOpts {
  fieldName: string;
  selected: string | TwoTierSelection | string[] | Array<AddOn>;
}

export interface AddOn {
  name: string;
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
