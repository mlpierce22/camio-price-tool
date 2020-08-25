import {
  AccountForm,
  AccountSubForm,
  PlanTemplates,
  AddOn,
  TwoTierSelectionOpts,
  AddOnOpts,
  TwoTierSelection
} from "./models";

// All possible options for each selection
export function possibleOptions() {
  return {
    resolution: [
      "1.3 MP",
      "2 MP",
      "3 MP",
      "4 MP",
      "5 MP",
      "6 MP",
      "8 MP",
      "12 MP"
    ],
    cloudRetention: ["15 day", "30 day", "45 day", "90 day"],
    cameraMotion: ["3 hrs", "6 hrs", "12 hrs", "24 hrs"],
    overageHandling: ["Lazy", "Charge", "Unlimited"],
    indexing: {
      // eslint-disable-next-line prettier/prettier
      "Lazy": ["3 days", "7 days", "14 days", "30 days"],
      "Query Match": ["10%", "25%", "50%", "90%"],
      // eslint-disable-next-line prettier/prettier
      "Full": [] // Edit: these shouldn't display a button. Note that these match camera motion "3 hrs", "6 hrs", "12 hrs", "24 hrs"
    } as TwoTierSelectionOpts,
    addOns: [
      { name: "Social Distancing", rate: [0, 100] },
      { name: "Tailgating", rate: [0, 100] },
      { name: "Counting", rate: [0, 100] }
    ] as Array<AddOnOpts>,
    socTools: [
      "None",

      "Basic (Event Streaming, Concurrent Review",
      "Plus (Basic + Camera Groups)",
      "Pro (Plus + Domain Hooks, Webhook Retries)"
    ],
    directoryIntegration: ["None", "G Suite Directory"],
    reporting: ["Basic (Health Monitoring)", "Plus (+ User Access Logs)"]
  };
}

// The templates that are available for the user to choose from and modify
export function planTemplates(): PlanTemplates {
  return {
    Basic: [
      {
        fieldName: "cloudRetention",
        label: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        label: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        label: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        label: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        label: "Add-Ons",
        selected: [] // None selected by default
      },
      {
        fieldName: "resolution",
        label: "Resolution",
        selected: [possibleOptions().resolution[1]] // 2MP cameras
      }
    ],
    "Social Distancing": [
      {
        fieldName: "cloudRetention",
        label: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        label: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        label: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        label: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        label: "Add-Ons",
        selected: [{ name: "Social Distancing", rate: 100 }] // Social Distancing selected by default
      },
      {
        fieldName: "resolution",
        label: "Resolution",
        selected: [possibleOptions().resolution[1]] // 2MP cameras
      }
    ],
    Tailgating: [
      {
        fieldName: "cloudRetention",
        label: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        label: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        label: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        label: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        label: "Add-Ons",
        selected: [{ name: "Tailgating", rate: 100 }] // Tailgating selected by default
      },
      {
        fieldName: "resolution",
        label: "Resolution",
        selected: [possibleOptions().resolution[1]] // 2MP cameras
      }
    ],
    Counting: [
      {
        fieldName: "cloudRetention",
        label: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        label: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        label: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        label: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        label: "Add-Ons",
        selected: [{ name: "Counting", rate: 100 }] // Counting selected by default
      },
      {
        fieldName: "resolution",
        label: "Resolution",
        selected: [possibleOptions().resolution[1]] // 2MP cameras
      }
    ]
  };
}

// The form data for the account page
export function accountFormData(): Array<AccountForm | AccountSubForm> {
  return [
    {
      fieldName: "resolution",
      isDefault: false,
      formType: "yes-no-select-dropdown",
      prompt: "Are your cameras all the same resolution?",
      subPrompt: "Resolution",
      selectionOpts: possibleOptions().resolution,
      selected: possibleOptions().resolution[1] // 2MP cameras
    },
    {
      fieldName: "cloudRetention",
      isDefault: false,
      formType: "yes-no-select-button-toggle",
      prompt:
        "Can we apply the same cloud storage retention time to all your cameras?",
      subPrompt: "How Long?",
      selectionOpts: possibleOptions().cloudRetention,
      selected: possibleOptions().cloudRetention[1] // 30 day
    },
    {
      fieldName: "cameraMotion",
      isDefault: false,
      formType: "yes-no-select-button-toggle",
      prompt:
        "Do all your cameras experience around the same amount of motion per day?",
      subPrompt: "How much motion?",
      selectionOpts: possibleOptions().cameraMotion,
      selected: possibleOptions().cameraMotion[1] // 6 hrs
    },
    {
      fieldName: "overageHandling",
      isDefault: false,
      formType: "yes-no-select-button-toggle",
      prompt: "Can we apply the same overage handling to all of your cameras?",
      subPrompt: "How should we handle overages?",
      selectionOpts: possibleOptions().overageHandling,
      selected: possibleOptions().overageHandling[0] // Lazy
    },
    {
      fieldName: "indexing",
      isDefault: false,
      formType: "yes-no-select-multi-button-toggle",
      prompt: "Can we apply the same indexing to all your footage?",
      subPrompt: "How much indexing do you want?",
      subSubPrompts: {
        Lazy: "How much video do you anticipate reviewing each month?",
        "Query Match": "How often will activity match the desired query?",
        Full: "This option uses the camera motion provided earlier."
      },
      selectionOpts: possibleOptions().indexing,
      selected: {
        type: "Lazy", // Lazy
        option: possibleOptions().indexing["Lazy"][1] // 7 days
      }
    },
    {
      fieldName: "addOns",
      isDefault: false,
      formType: "yes-no-select-checkbox",
      prompt: "Are any add-ons going to be applied to all of your cameras?",
      subPrompt: "Add Ons",
      selectionOpts: possibleOptions().addOns,
      selected: [] // None selected by default
    },
    {
      fieldName: "advancedOptions",
      advanced: true,
      formType: "advanced-options",
      subForm: [
        {
          fieldName: "directoryIntegration",
          isDefault: false,
          formType: "dropdown",
          prompt: "Directory Integration",
          selectionOpts: possibleOptions().directoryIntegration,
          selected: possibleOptions().directoryIntegration[0] // None
        },
        {
          fieldName: "socTools",
          isDefault: false,
          formType: "dropdown",
          prompt: "SOC Tools",
          selectionOpts: possibleOptions().socTools,
          selected: possibleOptions().socTools[0] // None
        },
        {
          fieldName: "reporting",
          isDefault: false,
          formType: "dropdown",
          prompt: "Reporting",
          selectionOpts: possibleOptions().reporting,
          selected: possibleOptions().reporting[1] // Basic
        }
      ]
    }
  ];
}
