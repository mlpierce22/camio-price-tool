<template>
  <v-app>
    <v-main>
      <!-- <div class="app-container"> -->
      <v-stepper
        :alt-labels="true"
        v-model="stepperData.progressionState.onStep"
        class="app-container"
        v-resize="checkOrientation"
        :vertical="stepperData.isVertical"
      >
        <v-stepper-header v-if="stepperData.progressionState.furthestStep != 0">
          <template class="app-steps" v-for="(step, index) in dynamicSlides">
            <v-divider v-if="index !== 0" :key="`${index}`"></v-divider>
            <v-stepper-step
              :key="`${index}-step`"
              :step="step.stepNumber"
              :complete="
                step.stepIndex < stepperData.progressionState.furthestStep
              "
              :editable="
                step.stepIndex < stepperData.progressionState.furthestStep
              "
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
import { QuoteIntroForm, BackNextButtonConfig } from "@/models";

export default Vue.extend({
  components: {
    // VNextBackButton,
    //TheQuoteIntroPage
  },

  data: () => ({
    stepperData: {
      orientationThreshold: 600,
      isVertical: false,
      progressionState: {
        // NOTE: None of these are indexes
        furthestStep: 0,
        onStep: 1,
        maxStep: 5,
        showLocations: true,
        locationStep: 4
      },
      steps: [
        {
          stepNumber: 1,
          stepIndex: 0,
          stepName: "Introduction",
          instance: ""
        },
        {
          stepNumber: 2,
          stepIndex: 1,
          stepName: "Account",
          instance: ""
        },
        {
          stepNumber: 3,
          stepIndex: 2,
          stepName: "Plans",
          instance: ""
        },
        {
          stepNumber: 4,
          stepIndex: 3,
          stepName: "Locations",
          instance: ""
        },
        {
          stepNumber: 5,
          stepIndex: 4,
          stepName: "Review",
          instance: ""
        }
      ]
    },
    formProgressionState: {
      furthestStep: 0, // Options for steps 0 (intro), 1 (account), 2 (plans), 3 (locations), 4 (done)
      onStep: 0,
      maxStep: 4,
      showLocations: true
    },
    // initButtonConfig: {
    //   nextText: "Account-wide",
    //   backText: "Back",
    //   showBack: false,
    //   showNext: true
    // } as BackNextButtonConfig,
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
  }),
  computed: {
    dynamicSlides: function() {
      if (this.stepperData.progressionState.showLocations === false) {
        const firstSteps: {}[] = this.stepperData.steps.slice(
          0,
          this.stepperData.progressionState.locationStep - 1
        );
        const lastSteps = this.stepperData.steps
          .slice(
            this.stepperData.progressionState.locationStep,
            this.stepperData.steps.length
          )
          .map((arrItem, indx) => {
            arrItem.stepNumber =
              this.stepperData.progressionState.locationStep + indx;

            return arrItem;
          });
        return [].concat(firstSteps as [], lastSteps as []);
      } else {
        return this.stepperData.steps;
      }
    }
  },
  methods: {
    checkOrientation: function() {
      this.stepperData.isVertical =
        window.innerWidth <= this.stepperData.orientationThreshold;
    },
    updateQuotePageVals: function(newValObj) {
      const castVal = parseInt(newValObj.newVal, 10);
      this.quoteIntroPageFormData[newValObj.key].value = castVal;
    },
    nextStep: function() {
      // If we are on the first step, we need to decide whether or not to show locations
      if (this.quoteIntroPageFormData["numLANLocations"].value === 1) {
        this.stepperData.progressionState.showLocations = false;
      } else {
        this.stepperData.progressionState.showLocations = true;
      }

      // Update the current step as long as it is less than or equal to the maxStep
      if (
        this.stepperData.progressionState.onStep + 1 <=
        this.stepperData.progressionState.maxStep
      ) {
        this.stepperData.progressionState.onStep++;
      }
      this.stepperData.progressionState.furthestStep = Math.max(
        this.stepperData.progressionState.onStep,
        this.stepperData.progressionState.furthestStep
      );
    },
    prevStep: function() {
      if (this.stepperData.progressionState.onStep - 1 >= 1) {
        this.stepperData.progressionState.onStep--;
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

  .v-stepper__header {
    box-shadow: none;
  }

  .app-content {
    padding: 40px 40px 40px 100px;

    @media only screen and (max-width: 650px) {
      padding: 40px;
    }
  }

  .seperator {
    border: 3px solid #f7931e;
    height: 3px;
    //margin: -100px;
    width: 100%;
  }
}
</style>
