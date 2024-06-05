import { defineConfig } from "cypress";
import registerCodeCoverageTasks from "@cypress/code-coverage/task";

export default defineConfig({

  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    specPattern: "tests/e2e_tests/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
    },
  },

  component: {
    specPattern: "tests/component_tests/*.cy.(ts|tsx)",

    supportFile: "cypress/support/component.ts",
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    }
  },
});
