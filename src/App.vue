<template>
  <v-app>
    <v-main>
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
                step: {{ step }}
                <button @click="nextStep()">Next</button>
                <button @click="prevStep()">Back</button>
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
              <v-card
                color="grey lighten-1"
                class="mb-12"
                height="200px"
              ></v-card>
              <button @click="nextStep()">Next</button>
              <button @click="prevStep()">Back</button>
            </v-stepper-content>
          </template>
        </v-stepper>
      </template>
      <template v-else>
        <!-- Show Done screen! -->
        <TheDonePage @edit="prevStep" @start-over="resetToDefaults" />
      </template>

      <!-- <div class="seperator"></div> -->
      <!-- <TheQuoteIntroPage
          v-if="formProgressionState.onStep === 0"
          :formData="quoteIntroPageFormData"
          @new-value-keyed="updateQuotePageVals($event)"
        /> -->
      <!-- Otherwise: stepper -->

      <!-- <VNextBackButton :buttonsConfig="" @nextStep="" /> -->
      <!-- </div> -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import TheQuoteIntroPage from "@/components/TheQuoteIntroPage.vue";
import VNextBackButton from "@/components/shared/VBackNextButton.vue";
import { QuoteIntroForm, BackNextButtonConfig, FormSteps } from "@/models";

export default Vue.extend({
  components: {
    // VNextBackButton,
    //TheQuoteIntroPage
  },

  data: () => ({
    isVertical: false,
    orientationThreshold: 600,
    progressionState: {
      // Options for steps 1 (intro), 2 (account), 3 (plans), 4 (locations), 5 (review), 6 (done!)
      // NOTE: None of these are indexes
      furthestStep: 1,
      onStep: 5,
      maxStep: 6,
      showLocations: true,
      locationStep: 4
    },
    steps: [
      {
        stepNumber: 1,
        stepIndex: 0,
        stepName: "Introduction",
        instance: "",
        nextButtonText: "",
        backButtonText: ""
      },
      {
        stepNumber: 2,
        stepIndex: 1,
        stepName: "Account",
        instance: "",
        nextButtonText: "",
        backButtonText: ""
      },
      {
        stepNumber: 3,
        stepIndex: 2,
        stepName: "Plans",
        instance: "",
        nextButtonText: "",
        backButtonText: ""
      },
      {
        stepNumber: 4,
        stepIndex: 3,
        stepName: "Locations",
        instance: "",
        nextButtonText: "",
        backButtonText: ""
      },
      {
        stepNumber: 5,
        stepIndex: 4,
        stepName: "Review",
        instance: "",
        nextButtonText: "",
        backButtonText: ""
      },
      {
        stepNumber: 6,
        stepIndex: 5,
        stepName: "Done",
        instance: "",
        nextButtonText: "",
        backButtonText: ""
      }
    ] as Array<FormSteps>,
    quoteIntroPageFormData: {
      numCameras: {
        prompt: "How many cameras do you have?",
        units: "Camera",
        value: 10
      },
      numLANLocations: {
        prompt: "Across how many LAN locations are your cameras located?",
        units: "Location",
        value: 2
      }
    } as QuoteIntroForm,
    accountPageFormData: {},
    createPlansPageFormData: {},
    addLocationsPageFormData: {}
    // initButtonConfig: {
    //   nextText: "Account-wide",
    //   backText: "Back",
    //   showBack: false,
    //   showNext: true
    // } as BackNextButtonConfig,
export default Vue.extend({
  components: {
    TheDonePage
    // VNextBackButton,
    //TheQuoteIntroPage
  },
  data: function() {
    return initialState(this);
  },

  computed: {
    dynamicSlides: function() {
      if (this.progressionState.showLocations === false) {
        const firstSteps: {}[] = this.steps.slice(
          0,
          this.progressionState.locationStep - 1
        );
        const lastSteps = this.steps
          .slice(this.progressionState.locationStep, this.steps.length)
          .map((arrItem, indx) => {
            arrItem.stepNumber = this.progressionState.locationStep + indx;

            return arrItem;
          });
        return [].concat(firstSteps as [], lastSteps as []);
      } else {
        return this.steps;
      }
    }
  },
  methods: {
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
    updateQuotePageVals: function(newValObj) {
      const castVal = parseInt(newValObj.newVal, 10);
      this.quoteIntroPageFormData[newValObj.key].value = castVal;
    },
    nextStep: function() {
      // If we are on the first step, we need to decide whether or not to show locations
      if (this.quoteIntroPageFormData["numLANLocations"].value === 1) {
        this.progressionState.showLocations = false;
      } else {
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
    // updateButtonConfig: function(step) {
    //   switch (step) {
    //     case 0:
    //       return {
    //         nextText: "Account-wide",
    //         backText: "Back to Intro",
    //         showBack: false,
    //         showNext: true
    //       };
    //     case 1:
    //       return {
    //         nextText: "Create Plans",
    //         backText: "Back to Account",
    //         showBack: true,
    //         showNext: true
    //       };
    //     case 2:
    //       return {
    //         nextText: this.formProgressionState.maxStep == 4 ? "Add Locations",
    //         backText: "Back to Plans",
    //         showBack: true,
    //         showNext: true
    //       };
    //     case 3 && this.formProgressionState.maxStep == 4:
    //       // then location
    //       return {
    //         nextText: "Next",
    //         backText: "Back",
    //         showBack: true,
    //         showNext: true
    //       };
    //     case 3 && this.formProgressionState.maxStep == 3:
    //       // then done
    //       return {
    //         nextText: "Next",
    //         backText: "Back",
    //         showBack: false,
    //         showNext: false
    //       };
    //     case 4:
    //       // then done
    //       return {
    //         nextText: "Next",
    //         backText: "Back",
    //         showBack: false,
    //         showNext: false
    //       };
    //   }
    //   if (step === 0) {
    //     this.initButtonConfig;
    //   }
    //   e;
    //   if (step === this.formProgressionState.maxStep) {
    //   }
    // },
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
    padding: 0px 40px 40px 100px;

    @media only screen and (max-width: 650px) {
      padding: 40px;
    }
  }
}
.done-card-container {
  display: flex;
  flex-direction: column;
  border: 3px solid #f7931e;
  border-radius: 20px;
  margin: 30px 10.3%;
  align-items: center;

  // .v-icon {
  //   font-size: 228px;
  // }

  .done-text {
    font-weight: bold;
    font-size: 50px;
    @media only screen and (max-width: 930px) {
      font-size: 30px;
    }
  }

  .text {
    font-size: 30px;
    max-width: 94%;

    @media only screen and (max-width: 930px) {
      font-size: 20px;
    }
  }

  .v-btn__content {
    display: flex;
    flex-direction: row;

    .btn-text {
      margin-left: 5px;
    }
  }

  .edit {
    margin-top: 21px;
  }

  .restart {
    margin: 21px 0px;
  }
}
</style>
