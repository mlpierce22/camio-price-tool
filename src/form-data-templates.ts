import { AccountForm, AccountSubForm } from "./models";

// All possible options for each selection
export function possibleOptions() {
  return {
    resolutions: [
      "1.3 MP",
      "2 MP",
      "3 MP",
      "4 MP",
      "5 MP",
      "6 MP",
      "8 MP",
      "12 MP"
    ],
    cloudStorage: ["15 day", "30 day", "45 day", "90 day"],
    cameraMotion: ["3 hrs", "6 hrs", "12 hrs", "24 hrs"],
    overageHandling: ["Lazy", "Charge", "Unlimited"],
    indexing: [
      { type: "Lazy", options: ["3 days", "7 days", "14 days", "30 days"] },
      { type: "Query Match", options: ["10%", "25%", "50%", "90%"] },
      { type: "Full", options: ["3 hrs", "6 hrs", "12 hrs", "24 hrs"] } // Note that these match camera motion
    ],
    addOns: [
      { name: "Social Distancing", rate: ["0%", "100%"] },
      { name: "Tailgating", rate: ["0%", "100%"] },
      { name: "Counting", rate: ["0%", "100%"] }
    ],
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
export function planTemplates() {
  return {
    basic: [
      {
        cloudRetention: {
          selectedRetention: possibleOptions().cloudStorage[1] // 30 day
        }
      },
      {
        camMotion: {
          selectedMotion: possibleOptions().cameraMotion[1] // 6 hrs
        }
      },
      {
        overageHandling: {
          selectedOverages: possibleOptions().overageHandling[0] // Lazy
        }
      },
      {
        indexing: {
          selectedIndexing: {
            type: possibleOptions().indexing[0].type, // Lazy
            option: possibleOptions().indexing[0].options[1] // 7 days
          }
        }
      },
      {
        addOns: {
          selectedAddOn: [] // None selected by default
        }
      },
      {
        directoryIntegration: {
          advanced: true,
          selectedIntegration: possibleOptions().directoryIntegration[0] // None
        }
      },
      {
        socTools: {
          advanced: true,
          selectedTools: possibleOptions().socTools[0] // None
        }
      },
      {
        reporting: {
          advanced: true,
          selectedReporting: possibleOptions().reporting[1] // Basic
        }
      },
      {
        camResolution: {
          resolutionsOnThisPlan: [possibleOptions().resolutions[1]] // 2MP cameras
        }
      }
    ],
    socialDistancing: [
      {
        cloudRetention: {
          selectedRetention: possibleOptions().cloudStorage[1] // 30 day
        }
      },
      {
        camMotion: {
          selectedMotion: possibleOptions().cameraMotion[1] // 6 hrs
        }
      },
      {
        overageHandling: {
          selectedOverages: possibleOptions().overageHandling[0] // Lazy
        }
      },
      {
        indexing: {
          selectedIndexing: {
            type: possibleOptions().indexing[0].type, // Lazy
            option: possibleOptions().indexing[0].options[1] // 7 days
          }
        }
      },
      {
        addOns: {
          selectedAddOn: [{ type: "Social Distancing", rate: 100 }] // None selected by default
        }
      },
      {
        directoryIntegration: {
          advanced: true,
          selectedIntegration: possibleOptions().directoryIntegration[0] // None
        }
      },
      {
        socTools: {
          advanced: true,
          selectedTools: possibleOptions().socTools[0] // None
        }
      },
      {
        reporting: {
          advanced: true,
          selectedReporting: possibleOptions().reporting[1] // Basic
        }
      },
      {
        camResolution: {
          resolutionsOnThisPlan: [possibleOptions().resolutions[1]] // 2MP cameras
        }
      }
    ],
    tailgating: [
      {
        cloudRetention: {
          selectedRetention: possibleOptions().cloudStorage[1] // 30 day
        }
      },
      {
        camMotion: {
          selectedMotion: possibleOptions().cameraMotion[1] // 6 hrs
        }
      },
      {
        overageHandling: {
          selectedOverages: possibleOptions().overageHandling[0] // Lazy
        }
      },
      {
        indexing: {
          selectedIndexing: {
            type: possibleOptions().indexing[0].type, // Lazy
            option: possibleOptions().indexing[0].options[1] // 7 days
          }
        }
      },
      {
        addOns: {
          selectedAddOn: [{ type: "Tailgating", rate: 100 }] // None selected by default
        }
      },
      {
        directoryIntegration: {
          advanced: true,
          selectedIntegration: possibleOptions().directoryIntegration[0] // None
        }
      },
      {
        socTools: {
          advanced: true,
          selectedTools: possibleOptions().socTools[0] // None
        }
      },
      {
        reporting: {
          advanced: true,
          selectedReporting: possibleOptions().reporting[1] // Basic
        }
      },
      {
        camResolution: {
          resolutionsOnThisPlan: [possibleOptions().resolutions[1]] // 2MP cameras
        }
      }
    ],
    counting: [
      {
        cloudRetention: {
          selectedRetention: possibleOptions().cloudStorage[1] // 30 day
        }
      },
      {
        camMotion: {
          selectedMotion: possibleOptions().cameraMotion[1] // 6 hrs
        }
      },
      {
        overageHandling: {
          selectedOverages: possibleOptions().overageHandling[0] // Lazy
        }
      },
      {
        indexing: {
          selectedIndexing: {
            type: possibleOptions().indexing[0].type, // Lazy
            option: possibleOptions().indexing[0].options[1] // 7 days
          }
        }
      },
      {
        addOns: {
          selectedAddOn: [{ type: "Counting", rate: 100 }] // None selected by default
        }
      },
      {
        directoryIntegration: {
          advanced: true,
          selectedIntegration: possibleOptions().directoryIntegration[0] // None
        }
      },
      {
        socTools: {
          advanced: true,
          selectedTools: possibleOptions().socTools[0] // None
        }
      },
      {
        reporting: {
          advanced: true,
          selectedReporting: possibleOptions().reporting[1] // Basic
        }
      },
      {
        camResolution: {
          resolutionsOnThisPlan: [possibleOptions().resolutions[1]] // 2MP cameras
        }
      }
    ]
  };
}

// The form data for the account page
export function accountFormData(): Array<AccountForm | AccountSubForm> {
  return [
    {
      fieldName: "camResolution",
      isDefault: false,
      selected: possibleOptions().resolutions[1] // 2MP cameras
    },
    {
      fieldName: "cloudRetention",
      isDefault: false,
      selected: possibleOptions().cloudStorage[1] // 30 day
    },
    {
      fieldName: "camMotion",
      isDefault: false,
      selected: possibleOptions().cameraMotion[1] // 6 hrs
    },
    {
      fieldName: "overageHandling",
      isDefault: false,
      selected: possibleOptions().overageHandling[0] // Lazy
    },
    {
      fieldName: "indexing",
      isDefault: false,
      selected: {
        type: possibleOptions().indexing[0].type, // Lazy
        option: possibleOptions().indexing[0].options[1] // 7 days
      }
    },
    {
      fieldName: "addOns",
      isDefault: false,
      selected: [] // None selected by default
    },
    {
      fieldName: "advancedOptions",
      advanced: true,
      subForm: [
        {
          fieldName: "directoryIntegration",
          isDefault: false,
          selected: possibleOptions().directoryIntegration[0] // None
        },
        {
          fieldName: "socTools",
          isDefault: false,
          selected: possibleOptions().socTools[0] // None
        },
        {
          fieldName: "reporting",
          isDefault: false,
          selected: possibleOptions().reporting[1] // Basic
        }
      ]
    }
  ];
}
