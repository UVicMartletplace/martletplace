import { BrowserRouter } from "react-router-dom";
import TestProviders from "../utils/TestProviders";
import Charities from "../../src/pages/Charities";

interface Organization {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

interface Charity {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
  organizations?: Organization[];
  funds: number;
  listingscount: number;
}

describe("<Charities />", () => {
  const expectedCharitiesObject: Charity[] = [
    {
      id: 1,
      name: "Save the Children",
      description: "Help children in need around the world.",
      start_date: "2024-06-01T14:14:50.534Z",
      end_date: "2024-12-12T14:14:50.534Z",
      image_url: "https://example.com/image.png",
      organizations: [
        {
          name: "Partner 1",
          logoUrl: "https://example.com/image.png",
          donated: 5000,
          receiving: true,
        },
        {
          name: "Partner 2",
          logoUrl: "https://example.com/image.png",
          donated: 3000,
          receiving: false,
        },
      ],
      funds: 50000,
      listingscount: 150,
    },
    {
      id: 2,
      name: "Red Cross",
      description: "Provide emergency assistance and disaster relief.",
      start_date: "2023-05-01T14:14:50.534Z",
      end_date: "2023-11-30T14:14:50.534Z",
      image_url: "https://example.com/image.png",
      organizations: [
        {
          name: "Partner A",
          logoUrl: "https://example.com/image.png",
          donated: 7000,
          receiving: true,
        },
        {
          name: "Partner B",
          logoUrl: "https://example.com/image.png",
          donated: 4000,
          receiving: false,
        },
      ],
      funds: 75000,
      listingscount: 200,
    },
    // other charities...
  ];

  const noPastCharitiesObject: Charity[] = [
    {
      id: 1,
      name: "Save the Children",
      description: "Help children in need around the world.",
      start_date: "2024-06-01T14:14:50.534Z",
      end_date: "2024-12-12T14:14:50.534Z",
      image_url: "https://example.com/image.png",
      organizations: [
        {
          name: "Partner 1",
          logoUrl: "https://example.com/image.png",
          donated: 5000,
          receiving: true,
        },
        {
          name: "Partner 2",
          logoUrl: "https://example.com/image.png",
          donated: 3000,
          receiving: false,
        },
      ],
      funds: 50000,
      listingscount: 150,
    },
  ];

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it("gets the charities and displays the current charity", () => {
    cy.intercept("GET", "/api/charities", {
      statusCode: 200,
      body: expectedCharitiesObject,
    }).as("charitiesRequest");

    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <Charities />
        </BrowserRouter>
      </TestProviders>
    );

    cy.wait("@charitiesRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", expectedCharitiesObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(
          expectedCharitiesObject
        );
      }
    });

    // Save the Children is the current charity
    cy.get("h4").should("contain.text", "Save the Children");
    cy.contains("Total Funds Donated");
    cy.contains("Charity Items Sold");
    cy.contains("Charity event ends in");
    cy.contains("Receiving Organizations");
    cy.contains("Partner Organizations");

    // Red Cross is one of the past charities
    cy.get("h4").should("not.contain.text", "Red Cross");
  });

  it("gets the charities and can go to the past charities view", () => {
    cy.intercept("GET", "/api/charities", {
      statusCode: 200,
      body: expectedCharitiesObject,
    }).as("charitiesRequest");

    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <Charities />
        </BrowserRouter>
      </TestProviders>
    );

    cy.wait("@charitiesRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", expectedCharitiesObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(
          expectedCharitiesObject
        );
      }
    });

    cy.get("#charitiesSwitch").click();
    cy.contains("Red Cross").should("exist");
  });

  it("should indicate if no past charity events", () => {
    cy.intercept("GET", "/api/charities", {
      statusCode: 200,
      body: noPastCharitiesObject,
    }).as("charitiesRequest");

    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <Charities />
        </BrowserRouter>
      </TestProviders>
    );

    cy.wait("@charitiesRequest").then((interception) => {
      // Log request and expected bodies for debugging
      cy.log("Request Body", interception.request.body);
      cy.log("Expected Body", noPastCharitiesObject);

      if (interception.response) {
        expect(interception.response.body).to.deep.equal(noPastCharitiesObject);
      }

      cy.get("#charitiesSwitch").click();
      cy.contains("No Past Charities").should("exist");
    });
  });
});
