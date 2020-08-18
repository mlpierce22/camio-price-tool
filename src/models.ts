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

export interface PropList {
  [propName: string]: QuoteIntroForm; // TODO: Add all types here
}

export interface FormSteps {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
  instance: Component;
  navButtons: BackNextButtonConfig;
  events?: ComponentEvents;
  props?: PropList;
}

export interface FormPlaceHolder {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
}
