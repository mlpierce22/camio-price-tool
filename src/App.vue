<template>
  <v-app>
    <v-main>
      <v-dialog v-model="showEditPlanModal" max-width="290">
        <v-card>
          TEst!
        </v-card>
      </v-dialog>
      <template v-if="progressionState.onStep != progressionState.maxStep">
        <v-stepper
          :alt-labels="true"
          v-model="progressionState.onStep"
          class="app-container"
          v-resize="checkOrientation"
          v-if="!isVertical"
          key="horizontal-stepper"
        >
          <v-stepper-header v-show="progressionState.furthestStep != 1">
            <template class="app-steps" v-for="(step, index) in dynamicSlides">
              <v-divider v-if="index !== 0" :key="`${index}`"></v-divider>
              <v-stepper-step
                :key="`${index}-step`"
                :step="step.stepNumber"
                :complete="step.stepNumber < progressionState.furthestStep"
                :editable="step.stepNumber < progressionState.furthestStep"
                edit-icon="$complete"
                class="stepper-step-horizontal"
                :color="chooseColor(step.stepNumber)"
              >
                {{ step.stepName }}
              </v-stepper-step>
            </template>
          </v-stepper-header>
          <v-stepper-items class="app-content">
            <template v-for="(step, index) in dynamicSlides">
              <v-stepper-content
                :key="`${index}-content`"
                :step="step.stepNumber"
              >
                <div class="REMOVE!" v-if="step.props">
                  <keep-alive>
                    <component
                      :is="step.instance"
                      :isVertical="isVertical"
                      v-bind="buildInputObject(step.props)"
                      v-on="step.events"
                    ></component>
                  </keep-alive>
                </div>
                <div class="REMOVE!" v-else>
                  <keep-alive>
                    <!-- TODO: remove this else -->
                    <component
                      :is="step.instance"
                      :isVertical="isVertical"
                      v-bind="computeProps(pagesData[step.propName])"
                      v-on="step.events"
                    ></component>
                  </keep-alive>
                </div>

                <VBackNextButton
                  v-if="step['navButtons']"
                  @next-click="nextStep()"
                  @back-click="prevStep()"
                  :next="step['navButtons']['nextText']"
                  :back="step['navButtons']['backText']"
                />
              </v-stepper-content>
            </template>
          </v-stepper-items>
        </v-stepper>

        <v-stepper
          v-model="progressionState.onStep"
          class="app-container"
          v-resize="checkOrientation"
          vertical
          v-else
          key="vertical-stepper"
        >
          <template v-for="(step, index) in dynamicSlides">
            <v-stepper-step
              class="vert-step"
              :complete="step.stepNumber < progressionState.furthestStep"
              :editable="step.stepNumber < progressionState.furthestStep"
              :key="`${index}-step-vert`"
              :step="step.stepNumber"
              :color="chooseColor(step.stepNumber)"
              edit-icon="$complete"
              v-show="hideAllExceptFirst(step.stepNumber)"
            >
              {{ step.stepName }}
            </v-stepper-step>
            <v-stepper-content
              :key="`${index}-content-vert`"
              :step="step.stepNumber"
              :class="{
                'hide-border': !hideAllExceptFirst(step.stepNumber)
              }"
            >
              <keep-alive>
                <component
                  :is="step.instance"
                  :isVertical="isVertical"
                  v-bind="computeProps(pagesData[step.propName])"
                  v-on="step.events"
                ></component>
              </keep-alive>
              <VBackNextButton
                v-if="step['navButtons']"
                @next-click="nextStep()"
                @back-click="prevStep()"
                :next="step['navButtons']['nextText']"
                :back="step['navButtons']['backText']"
              />
            </v-stepper-content>
          </template>
        </v-stepper>
      </template>
      <template v-else>
        <!-- Show Done screen! -->
        <TheDonePage @edit="prevStep" @start-over="resetToDefaults" />
      </template>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import TheQuoteIntroPage from "@/components/TheQuoteIntroPage.vue";
import TheAccountPage from "@/components/TheAccountPage.vue";
import TheCreatePlansPage from "@/components/TheCreatePlansPage.vue";
import TheAddLocationsPage from "@/components/TheAddLocationsPage.vue";
import TheEstimatePage from "@/components/TheEstimatePage.vue";
import VBackNextButton from "@/components/shared/VBackNextButton.vue";
import TheDonePage from "@/components/TheDonePage.vue";
import {
  QuoteIntroForm,
  FormSteps,
  FormPlaceHolder,
  PagesData,
  PropsList,
  PropBuilderOptions,
  ComponentProps,
  PromptedNumberInputObject,
  AccountForm,
  AccountSubForm,
  CamResolution,
  Plan,
  FullFilteredPlan,
  AddOn,
  AddOnOpts
} from "@/models";
import {
  FinalYAMLObject,
  OverallData,
  OverallChange,
  DefaultChange
} from "@/new-models";
import {
  possibleOptions,
  planTemplates,
  accountFormData
} from "@/form-data-templates";
import { Prop } from "vue-property-decorator";
// TODO:
/**
 * Addons are just an array of strings - for default case - ["social distancing"] means exclude social distancing from options
 * create "defaults" array that we use to filter the options available
 * change prop names to be a bunch of objects [{ fromFinal: boolean, field: string }]
 *
 */

/** Set the initial state of the function - allows us to reset everything. */
function initialState(componentInstance) {
  return {
    isVertical: false,
    orientationThreshold: 600,
    progressionState: {
      // Options for steps 1 (intro), 2 (account), 3 (plans), 4 (locations), 5 (review), 6 (done!)
      // NOTE: None of these are indexes
      furthestStep: 1,
      onStep: 1,
      maxStep: 6,
      showLocations: true,
      locationStep: 4
    },
    showEditPlanModal: false,
    finalYAMLObject: {
      overall: {
        totalCameras: 10,
        totalLocations: 1,
        socTools: possibleOptions().socTools[0], // None
        directoryIntegration: possibleOptions().directoryIntegration[0], // None
        reporting: possibleOptions().reporting[0] // Basic
      },
      plans: {},
      locations: {
        1: {
          title: "Location 1",
          numCameras: 1,
          planIds: { 1: 1 }, // set some default
          useVM: false
        }
      }
    } as FinalYAMLObject,
    defaults: {},
    plans: {},
    locations: {},
    steps: [
      {
        stepNumber: 1,
        stepIndex: 0,
        stepName: "Introduction",
        instance: TheQuoteIntroPage,
        navButtons: {
          nextText: "Next",
          backText: "Back"
        },
        events: {
          "change-overall": componentInstance.changeOverall
        },
        propName: "quoteIntroPageFormData",
        props: {
          get: [
            {
              field: "overall",
              getterFunction: "getOverall",
              importedFunction: null
            }
          ],
          formItems: [
            {
              key: "totalCameras",
              prompt: "How many cameras do you have?",
              units: "Cameras"
            },
            {
              key: "totalLocations",
              prompt: "Across how many LAN locations are your cameras located?",
              units: "Location"
            }
          ] as Array<QuoteIntroForm>
        }
      },
      {
        stepNumber: 2,
        stepIndex: 1,
        stepName: "Account",
        instance: TheAccountPage,
        navButtons: {
          nextText: "Next",
          backText: "Back"
        },
        events: {
          "changed-form-item": componentInstance.updateAccountPageVals,
          "change-overall": componentInstance.changeOverall,
          "add-default": componentInstance.addDefault,
          "remove-default": componentInstance.removeDefault,
          "modify-default": componentInstance.modifyDefault
        },
        propName: "accountPageFormData",
        props: {
          get: [
            {
              field: "formData",
              getterFunction: "getDefaultsForm",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 3,
        stepIndex: 2,
        stepName: "Plans",
        instance: TheCreatePlansPage,
        navButtons: {
          nextText: "Next",
          backText: "Back"
        },
        events: {
          "add-plan": componentInstance.addPlan
        },
        propName: "createPlansPageFormData",
        props: {
          get: [
            {
              field: "planTemplates",
              getterFunction: "getFilteredPlanTemplates",
              importedFunction: null
            },
            {
              field: "accountData",
              getterFunction: "getFilteredAccountData",
              importedFunction: null
            },
            {
              field: "createdPlans",
              getterFunction: "getPlans",
              importedFunction: null
            },
            {
              field: "isVertical",
              getterFunction: "",
              importedFunction: null
            },
            {
              field: "defaults",
              getterFunction: "",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 4,
        stepIndex: 3,
        stepName: "Locations",
        instance: TheAddLocationsPage,
        navButtons: {
          nextText: "Next",
          backText: "Back"
        },
        events: {
          "add-location": componentInstance.addLocation,
          "modify-location": componentInstance.modifyLocation,
          "delete-location": componentInstance.deleteLocation,
          "modify-plan": componentInstance.modifyPlan
        },
        propName: "addLocationsPageFormData",
        props: {
          get: [
            {
              field: "plans",
              getterFunction: "getPlans",
              importedFunction: null
            },
            {
              field: "initialFormData",
              getterFunction: "getOverall",
              importedFunction: null
            },
            {
              field: "locations",
              getterFunction: "getLocations",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 5,
        stepIndex: 4,
        stepName: "Review",
        instance: TheEstimatePage,
        navButtons: {
          nextText: "Next",
          backText: "Back"
        },
        events: {},
        propName: "estimatePageData"
      },
      {
        stepNumber: 6,
        stepIndex: 5,
        stepName: "Done"
      }
    ] as Array<FormSteps | FormPlaceHolder>,
    pagesData: {
      // quoteIntroPageFormData: {
      //   formData: {
      //     numCameras: {
      //       prompt: "How many cameras do you have?",
      //       units: "Cameras",
      //       value: 10
      //     },
      //     numLANLocations: {
      //       prompt: "Across how many LAN locations are your cameras located?",
      //       units: "Location",
      //       value: 1
      //     }
      //   } as QuoteIntroForm
      // },
      // accountPageFormData: {
      //   formData: accountFormData()
      // },
      // createPlansPageFormData: {
      //   planTemplates: planTemplates(),
      //   createdPlans: {},
      //   include: [
      //     {
      //       data: "accountPageFormData",
      //       propName: "accountData",
      //       field: "formData"
      //     }
      //   ]
      // },
      addLocationsPageFormData: {
        plans: {},
        locations: {},
        include: [
          {
            data: "createPlansPageFormData",
            propName: "plans",
            field: "createdPlans"
          },
          {
            data: "quoteIntroPageFormData",
            propName: "initialFormData",
            field: "formData"
          }
        ]
      },
      estimatePageData: {
        temp: {}
      }
    } as PagesData
  };
}

export default Vue.extend({
  components: {
    TheQuoteIntroPage,
    TheAccountPage,
    TheCreatePlansPage,
    TheAddLocationsPage,
    TheEstimatePage,
    TheDonePage,
    VBackNextButton
  },
  data: function() {
    return initialState(this);
  },
  computed: {
    getFilteredAccountData: function() {
      const data = accountFormData();
      return data.filter(field => {
        // special case because we still want to show addons, if they exist
        if (field.fieldName == "addOns") {
          if (this.defaults[field.fieldName]) {
            const filteredSelected = ((field as AccountForm)
              .selectionOpts as AddOnOpts[]).filter(
              selected =>
                !this.defaults[field.fieldName].includes(selected.name)
            );
            return filteredSelected.length !== 0;
          }
          return true;
        }
        return this.defaults[field.fieldName] ||
          field.fieldName == "advancedOptions"
          ? false
          : true;
      });
    },
    getFilteredPlanTemplates: function() {
      const planTemplatesToFilter = planTemplates();
      const filtered = Object.keys(planTemplatesToFilter).map(key => {
        return {
          title: key,
          templateOptions: planTemplatesToFilter[key].filter(planOption => {
            // special case because we still want to show addons, if they exist
            if (planOption.fieldName == "addOns") {
              if (this.defaults[planOption.fieldName]) {
                const filteredSelected = possibleOptions().addOns.filter(
                  selected =>
                    !this.defaults[planOption.fieldName].includes(selected.name)
                );
                return filteredSelected.length !== 0;
              }
              return true;
            }
            // if it is in defaults, don't return it
            return this.defaults[planOption.fieldName] ? false : true;
          })
        };
      });
      const reconstructed = {};
      filtered.map(planTemplates => {
        reconstructed[planTemplates.title] = planTemplates.templateOptions;
      });
      return reconstructed;
    },
    getDefaultsForm: function() {
      const form = accountFormData();
      form.map(formObject => {
        if (formObject.fieldName == "advancedOptions") {
          (formObject as AccountSubForm).subForm = (formObject as AccountSubForm).subForm.map(
            form => {
              form.selected = this.finalYAMLObject.overall[form.fieldName];
              return form;
            }
          );
        } else if (this.defaults[formObject.fieldName]) {
          (formObject as AccountForm).selected = this.defaults[
            formObject.fieldName
          ];
        }
      });
      return form;
    },
    getLocations: function() {
      return this.finalYAMLObject.locations;
    },

    getPlans: function() {
      return this.finalYAMLObject.plans;
    },

    getOverall: function() {
      return this.finalYAMLObject.overall;
    },
    dynamicSlides: function(): (FormSteps | FormPlaceHolder)[] {
      if (this.progressionState.showLocations === false) {
        const firstSteps: {}[] = this.steps.slice(
          0,
          this.progressionState.locationStep - 1
        );
        const lastSteps = this.steps
          .slice(this.progressionState.locationStep, this.steps.length)
          .map((arrItem, indx) => {
            arrItem.stepNumber = this.progressionState.locationStep + indx;
            arrItem.stepIndex = this.progressionState.locationStep + indx - 1;

            return arrItem;
          });
        return [].concat(firstSteps as [], lastSteps as []);
      } else {
        const renumbered = this.steps.map((step, index) => {
          const newStep = step;
          newStep.stepNumber = index + 1;
          newStep.stepIndex = index;
          return newStep;
        });
        return [].concat(renumbered as []);
      }
    }
  },
  watch: {
    isVertical: function() {
      const currStep = this.progressionState.onStep;
      this.progressionState.onStep = 1;
      requestAnimationFrame(() => (this.progressionState.onStep = currStep));
    }
  },
  created() {
    this.$vuetify.theme.themes.light.primary = "#f7931e";
    this.$vuetify.theme.themes.light.secondary = "#50B536";
    this.$vuetify.theme.themes.light.error = "#FF0000";
  },
  methods: {
    // BEGIN FUNCTIONS TO MODIFY FINAL YAML OBJECT
    changeOverall(change: OverallChange) {
      const totalLocations = this.finalYAMLObject.overall.totalLocations;
      if (change.key == "totalLocations") {
        if (change.value > totalLocations) {
          for (let i = totalLocations + 1; i <= change.value; ++i) {
            this.addLocation();
          }
        } else if (change.value < totalLocations) {
          for (let i = (change.value as number) + 1; i <= totalLocations; ++i) {
            this.deleteLocation(i);
          }
        }
      } else {
        this.$set(this.finalYAMLObject.overall, change.key, change.value);
      }
    },

    addLocation() {
      const newLocNum = Object.keys(this.finalYAMLObject.locations).length + 1;
      this.$set(this.finalYAMLObject.locations, newLocNum, {
        title: "Location " + newLocNum,
        numCameras: 1,
        planIds: { 1: 1 }, // set some default
        useVM: false
      });
      this.$set(
        this.finalYAMLObject.overall,
        "totalLocations",
        Object.keys(this.finalYAMLObject.locations).length
      );
    },

    deleteLocation(locationId: number) {
      const totalLocations = Object.keys(this.finalYAMLObject.locations).length;
      if (totalLocations > 1) {
        this.$delete(this.finalYAMLObject.locations, locationId);
        this.$set(
          this.finalYAMLObject.overall,
          "totalLocations",
          totalLocations - 1
        );
      }
    },
    modifyLocation(toEdit: { index: number; field: string; payload: any }) {
      this.$set(
        this.finalYAMLObject.locations[toEdit.index],
        toEdit.field,
        toEdit.payload
      );
    },
    addDefault(payload: DefaultChange) {
      this.$set(this.defaults, payload.field, payload.value);
    },
    removeDefault(fieldToRemove: string) {
      this.$delete(this.defaults, fieldToRemove);
    },
    modifyDefault(payload: DefaultChange) {
      this.$set(this.defaults, payload.field, payload.value);
    },
    addPlan(payload: {
      resolutionsToHandle: Array<CamResolution>;
      plan: Array<AccountForm>;
    }) {
      const defaultKeys = Object.keys(this.defaults);
      const plans = payload.resolutionsToHandle.map(
        (cameraResolution: CamResolution) => {
          const purePlanObj = {};
          payload.plan.map(planField => {
            // Assign the title to the resolution field (since it isnt handled in the plan)
            if (planField.fieldName == "resolution") {
              purePlanObj[planField.fieldName] = cameraResolution.title;

              // handle custom naming if multiple resolutions
            } else if (
              planField.fieldName == "title" &&
              payload.resolutionsToHandle.length > 1
            ) {
              purePlanObj[planField.fieldName] =
                planField.selected + " w/" + cameraResolution.title;
            } else {
              purePlanObj[planField.fieldName] = planField.selected;
            }
          });
          // add defaults and try to merge if key exists
          defaultKeys.map(key => {
            // currently that means it is resolution or addons
            if (purePlanObj[key]) {
              if (Array.isArray(purePlanObj[key])) {
                purePlanObj[key] = [].concat(
                  purePlanObj[key],
                  this.defaults[key]
                );
              }
            } else {
              purePlanObj[key] = this.defaults[key];
            }
          });
          // Add num cameras field
          purePlanObj["numCameras"] = cameraResolution.numCameras;
          // represents how many cameras are assigned to a location
          purePlanObj["camerasAssigned"] = 0;

          return purePlanObj;
        }
      );
      plans.forEach(plan => {
        const planCode = this.generatePlanCode(plan);
        this.$set(this.finalYAMLObject.plans, planCode, plan);
      });
      console.log("added this plan!", plans);
    },

    deletePlan(planId: string) {
      console.log("deleting plan!");
    },

    modifyPlan(payload: { planId: number; field: string; payload: any }) {
      if (Array.isArray(payload)) {
        payload.forEach(planToModify => {
          this.$set(
            this.finalYAMLObject.plans[planToModify.planId],
            planToModify.field,
            planToModify.payload
          );
        });
      } else {
        // TODO: is this ever true? how to we reset from the initial 1: in locations object
        this.$set(
          this.finalYAMLObject.plans[payload.planId],
          payload.field,
          payload.payload
        );
      }
    },

    // END FUNCTIONS TO MODIFY FINAL YAML OBJECT

    openEditPlanModal(planId: number) {
      console.log("opening the edit plan modal!"); // TODO: handle this
    },
    buildInputObject(props: ComponentProps) {
      if (props) {
        const propObject = {};
        Object.keys(props).map(key => {
          if (key == "get") {
            props[key].forEach(prop => {
              if (prop.getterFunction !== "") {
                this.$set(propObject, prop.field, this[prop.getterFunction]);
              } else if (prop.importedFunction) {
                this.$set(propObject, prop.field, prop.importedFunction);
              } else {
                this.$set(propObject, prop.field, this[prop.field]);
              }
            });
          } else {
            this.$set(propObject, key, props[key]);
          }
        });

        console.log(propObject);
        return propObject;
      }
      // Done case
      return;
    },
    computeProps(propObj: PropsList) {
      console.log(propObj);
      // Make sure the object exists
      if (propObj) {
        // if ("include" in propObj) {
        //   propObj.include.forEach(inclusion => {
        //     // Allow to choose one subfield specifically
        //     if (inclusion["field"]) {
        //       this.$set(
        //         propObj,
        //         inclusion.propName,
        //         this.pagesData[inclusion.data][inclusion.field]
        //       );
        //     } else {
        //       this.$set(
        //         propObj,
        //         inclusion.propName,
        //         this.pagesData[inclusion.data]
        //       );
        //     }
        //   });
        //   delete propObj.include;
        // }
        return propObj;
      } else {
        // This is for the done case.
        return;
      }
    },
    updateLocation(locations) {
      this.$set(
        this.pagesData["addLocationsPageFormData"],
        "locations",
        locations
      );
      // if (locations) {
      //   this.$set(
      //     this.pagesData["quoteIntroPageFormData"]["formData"][
      //       "numLANLocations"
      //     ],
      //     "value",
      //     Object.keys(locations).length
      //   );
      // }
    },
    updateLocationCount(count: number) {
      this.updateQuotePageVals({ key: "numLANLocations", newVal: count });
    },
    updateAssignedPlansCount(
      planIds: { planId: number; sumAssigned: number }[]
    ) {
      planIds.forEach(plan => {
        console.log(
          "this is it",
          this.pagesData["addLocationsPageFormData"]["plans"],
          plan
        );
        // if (this.pagesData["addLocationsPageFormData"]["plans"][plan.planId]) {
        console.log("is this ever true");
        this.$set(
          this.pagesData["addLocationsPageFormData"]["plans"][plan.planId],
          "camerasAssigned",
          plan.sumAssigned
        );
        // }
      });
    },
    // TODO: does this need this.$set?
    resetToDefaults: function() {
      const data = initialState(this);
      Object.keys(data).forEach(key => (this[key] = data[key]));
    },
    chooseColor: function(stepNumber) {
      if (stepNumber < this.progressionState.furthestStep) {
        return "secondary";
      } else {
        return "primary";
      }
    },
    hideAllExceptFirst: function(currentStep) {
      return this.progressionState.furthestStep != 1 || currentStep == 1;
    },
    checkOrientation: function() {
      this.isVertical = window.innerWidth <= this.orientationThreshold;
    },
    updateAccountPageVals: function(newValObj) {
      this.$set(
        this.pagesData.accountPageFormData.formData[newValObj.index],
        newValObj.fieldChanged,
        newValObj.payload
      );
    },
    updateQuotePageVals: function(newValObj) {
      const castVal = parseInt(newValObj.newVal, 10);
      console.log("this runs?");
      this.$set(
        this.pagesData.quoteIntroPageFormData.formData[newValObj.key],
        "value",
        castVal
      );
      console.log("yep?");
    },
    // TODO: Determine hashing function
    generatePlanCode(plan) {
      // Courtesy of https://stackoverflow.com/a/33647870
      let hash = 0;
      let i = 0;
      const str = JSON.stringify(plan);
      const length = str.length;

      while (i < length) {
        hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
      }

      return hash;
    },
    addNewPlans: function(plans) {
      // TODO: bug fixes = check for all resetting of data and make sure to use this.$set()
      console.log("creating new plans, ", plans);
      plans.forEach(plan => {
        const planCode = this.generatePlanCode(plan);
        this.$set(this.plans, planCode, plan);
        this.$set(
          this.pagesData.createPlansPageFormData.createdPlans,
          planCode,
          plan
        );
      });
    },
    nextStep: function() {
      // If we are on the first step, we need to decide whether or not to show locations
      if (
        this.finalYAMLObject.overall.totalLocations == 1 &&
        this.progressionState.onStep == 1
      ) {
        this.progressionState.showLocations = false;
      } else if (
        this.finalYAMLObject.overall.totalLocations > 1 &&
        this.progressionState.onStep == 1
      ) {
        this.progressionState.showLocations = true;
      }

      // Change the max steps to match
      this.progressionState.maxStep = this.dynamicSlides.length;

      // Update the current step as long as it is less than or equal to the maxStep
      if (this.progressionState.onStep + 1 <= this.progressionState.maxStep) {
        this.progressionState.onStep++;
      }
      this.progressionState.furthestStep = Math.max(
        this.progressionState.onStep,
        this.progressionState.furthestStep
      );
    },
    prevStep: function() {
      if (this.progressionState.onStep - 1 >= 1) {
        this.progressionState.onStep--;
      }
    }
  }
});
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  border: 3px solid #f7931e;
  border-radius: 20px;
  margin: 30px 10.3%;

  .v-stepper__step {
    flex-basis: 0;
  }

  .v-divider {
    max-width: 13%;
    margin: 45px -67px 0 !important;

    @media only screen and (max-width: 790px) {
      max-width: 6vw;
    }
  }

  .v-stepper__header {
    box-shadow: none;
    border-bottom: 3px #f7931e solid;
  }

  .stepper-step-horizontal {
    ::v-deep .v-stepper__label {
      display: flex !important;
    }

    ::v-deep .v-stepper__step__step {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }
  }

  .vert-step {
    ::v-deep .v-stepper__step__step {
      width: 40px;
      height: 40px;
      font-size: 18px;
      margin-left: -7px;
    }
  }

  .v-stepper__label {
    display: flex !important;
  }

  .hide-border {
    border-left: none !important;
  }

  .app-content {
    padding: 0px 40px 40px 40px;

    @media only screen and (max-width: 650px) {
      padding: 40px;
    }
  }
}
</style>
