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
      "0.3 MP",
      "0.9 MP",
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
      "Query Match": ["10 %", "25 %", "50 %", "90 %"],
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
        prompt: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        prompt: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        prompt: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        prompt: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        prompt: "Add-Ons",
        selected: [] // None selected by default
      },
      {
        fieldName: "resolution",
        prompt: "Resolution",
        selected: [possibleOptions().resolution[3]] // 2MP cameras
      }
    ],
    "Social Distancing": [
      {
        fieldName: "cloudRetention",
        prompt: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        prompt: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        prompt: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        prompt: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        prompt: "Add-Ons",
        selected: [{ name: "Social Distancing", rate: 100 }] // Social Distancing selected by default
      },
      {
        fieldName: "resolution",
        prompt: "Resolution",
        selected: [possibleOptions().resolution[3]] // 2MP cameras
      }
    ],
    Tailgating: [
      {
        fieldName: "cloudRetention",
        prompt: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        prompt: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        prompt: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        prompt: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        prompt: "Add-Ons",
        selected: [{ name: "Tailgating", rate: 100 }] // Tailgating selected by default
      },
      {
        fieldName: "resolution",
        prompt: "Resolution",
        selected: [possibleOptions().resolution[3]] // 2MP cameras
      }
    ],
    Counting: [
      {
        fieldName: "cloudRetention",
        prompt: "Cloud Retention",
        selected: possibleOptions().cloudRetention[1] // 30 day
      },
      {
        fieldName: "cameraMotion",
        prompt: "Camera Motion",
        selected: possibleOptions().cameraMotion[1] // 6 hrs
      },
      {
        fieldName: "overageHandling",
        prompt: "Overage Handling",
        selected: possibleOptions().overageHandling[0] // Lazy
      },
      {
        fieldName: "indexing",
        prompt: "Indexing",
        selected: {
          type: "Lazy", // Lazy
          option: possibleOptions().indexing["Lazy"][1] // 7 days
        }
      },
      {
        fieldName: "addOns",
        prompt: "Add-Ons",
        selected: [{ name: "Counting", rate: 100 }] // Counting selected by default
      },
      {
        fieldName: "resolution",
        prompt: "Resolution",
        selected: [possibleOptions().resolution[3]] // 2MP cameras
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
      selected: possibleOptions().resolution[3] // 2MP cameras
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
          selected: "" // selected from finalYAMLObject
        },
        {
          fieldName: "socTools",
          isDefault: false,
          formType: "dropdown",
          prompt: "SOC Tools",
          selectionOpts: possibleOptions().socTools,
          selected: "" // selected from finalYAMLObject
        },
        {
          fieldName: "reporting",
          isDefault: false,
          formType: "dropdown",
          prompt: "Reporting",
          selectionOpts: possibleOptions().reporting,
          selected: "" // selected from finalYAMLObject
        }
      ]
    }
  ];
}

// ------------------------------------- Pricing helpers -------------------------------------

// The camio box info (like how many of each resolution they can have)
export function camioBoxes() {
  // TODO: figure out actual numbers here since they don't fit into the formula nicely when they are under 2. Also, none of the counts seem right for the 1170R
  return {
    "1770R": {
      description:
        "Box 2U, 2 x Intel Xeon Gold 5220 2.2G, 18C/36T, 10.4GT/s, 24.75M Cache, 96GB RAM, 2 x NVIDIA Quadro RTX 5000, 480GB SSD, 2 x 8TB SATA HDD",
      bom: { cores: 36, ram: 96 },
      link: "/box/#1770R",
      price: 1428500,
      counts: {
        "0.3 MP": 146 * 3,
        "0.9 MP": 71 * 3,
        "1.3 MP": 126,
        "2 MP": 42 * 3,
        "3 MP": 32 * 3,
        "4 MP": 26 * 3,
        "5 MP": 22 * 3,
        "6 MP": 20 * 3,
        "8 MP": 16 * 3,
        "12 MP": 21
      }
    },
    "1730R": {
      description:
        "Box 2U Intel Xeon Silver 4214 2.2G, 12C/24T, 9.6GT/s, 16.5M Cache, 32 GB RAM, NVIDIA Quadro RTX 4000, 480 GB SSD, 2 x 1TB SATA HDD",
      bom: { cores: 12, ram: 32 },
      link: "/box/#1730R",
      price: 572000,
      counts: {
        "0.3 MP": 146,
        "0.9 MP": 71,
        "1.3 MP": 42,
        "2 MP": 42,
        "3 MP": 32,
        "4 MP": 26,
        "5 MP": 22,
        "6 MP": 20,
        "8 MP": 16,
        "12 MP": 7
      }
    },
    "1510A": {
      description:
        "Box appliance Intel i5-9500 (Coffee Lake) 3.0 GHz 6C/6T, NVIDIA GTX 1660S, 16 GB RAM, 256 GB SSD, 1920 GB SATA SSD",
      bom: { cores: 6, ram: 16 },
      link: "/box/#1510A",
      price: 199200,
      counts: {
        "0.3 MP": 48,
        "0.9 MP": 23,
        "1.3 MP": 14,
        "2 MP": 14,
        "3 MP": 10,
        "4 MP": 8,
        "5 MP": 7,
        "6 MP": 6,
        "8 MP": 5,
        "12 MP": 2
      }
    },
    "1110A": {
      description:
        "Box ARM® Cortex® A53 (ARMv8) 1.5GHz 4C/4T, 2 GB RAM (no disk storage)",
      bom: { cores: 4, ram: 2 },
      link: "/box/#1110A",
      price: 19900,
      counts: {
        "0.3 MP": 6,
        "0.9 MP": 3,
        "1.3 MP": 2,
        "2 MP": 2,
        "3 MP": 1,
        "4 MP": 1,
        "5 MP": 1,
        "6 MP": 0,
        "8 MP": 0,
        "12 MP": 0
      }
    },
    BoxVM: {
      description:
        "<strong>OR</strong> the free <a href='/box/vm'>Box VM</a> installed on your own hardware",
      link: "/box/#VM",
      price: 0,
      counts: {
        "0.3 MP": 146,
        "0.9 MP": 71,
        "1.3 MP": 42,
        "2 MP": 42,
        "3 MP": 32,
        "4 MP": 26,
        "5 MP": 22,
        "6 MP": 20,
        "8 MP": 16,
        "12 MP": 7
      }
    }
  };
}

// Mappings from megapixels to other things
export function megapixelMappings() {
  return {
    "0.3 MP": { resolution: "640×480", p: "480", bitrate: 512 },
    "0.9 MP": { resolution: "1280×720", p: "720", bitrate: 1024 },
    "1.3 MP": { resolution: "1280×1024", p: "1024", bitrate: 1280 },
    "2 MP": { resolution: "1920x1080", p: "1080", bitrate: 1536 },
    "3 MP": { resolution: "2048x1536", p: "1536", bitrate: 2048 },
    "4 MP": { resolution: "2592x1520", p: "1520", bitrate: 2048 },
    "5 MP": { resolution: "2560x1960", p: "1960", bitrate: 2048 + 512 },
    "6 MP": { resolution: "3072x2048", p: "2048", bitrate: 1024 * 3 },
    "8 MP": { resolution: "3840x2160", p: "2160", bitrate: 2048 * 2 },
    "12 MP": { resolution: "4290x2800", p: "2800", bitrate: 2048 * 4 }
  };
}

// Get important info for calculating cloud pricing
export function cloudData() {
  return {
    FPS_RATED: 20, // https://help.camio.com/hc/en-us/articles/115005656586-How-many-video-streams-can-one-Camio-Box-handle-
    GIGABYTE_BYTES: 1073741824,
    KILOBITS: 1024,
    PRICE_PER_EVENT_WRITTEN_STORED_PER_MONTH_CENTS: 0.026704 * 1.4,
    PRICE_GCS_PER_GIGABYTE_PER_MONTH_CENTS: 100 * 0.026,
    PRICE_GCS_PER_BYTE_PER_MONTH_CENTS: (100 * 0.026) / 1073741824,
    EVENT_DURATION_SECONDS: 24,
    UPGRADE_BOX_THRESHOLD_PERCENT: 0.6
  };
}

export function pricingObject() {
  // Note: all prices in cents
  return {
    // multiplied by total number of streams
    "account wide": {
      socTools: {
        None: 0,
        "Basic (Event Streaming, Concurrent Review": 100,
        "Plus (Basic + Camera Groups)": 300,
        "Pro (Plus + Domain Hooks, Webhook Retries)": 400
      },
      directoryIntegration: {
        None: 0,
        "G Suite Directory": 4
      },
      reporting: {
        "Basic (Health Monitoring)": 0,
        "Plus (+ User Access Logs)": 8
      }
    },
    location: {
      plan: {
        "Social Distancing": 1000,
        Tailgating: 1000,
        Counting: 1000,
        cloudData: cloudData()
        // price per stream has to be dynamically determined
      },
      hardware: camioBoxes()
    }
  };
}
