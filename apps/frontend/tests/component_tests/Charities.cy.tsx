import { BrowserRouter } from "react-router-dom";
import TestProviders from "../utils/TestProviders";
import Charities from "../../src/pages/Charities";

describe("<Charities />", () => {
  beforeEach(() => {
    cy.mount(
      <TestProviders>
        <BrowserRouter>
          <Charities />
        </BrowserRouter>
      </TestProviders>
    );

    cy.viewport(1280, 720);
  });

  const expectedCharitiesObject = [
    {
      id: "1",
      name: "Save the Children",
      description: "Help children in need around the world.",
      startDate: "2024-06-01T14:14:50.534Z",
      endDate: "2024-12-12T14:14:50.534Z",
      imageUrl: "https://example.com/image.png",
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
      listingsCount: 150,
    },
    {
      id: "2",
      name: "Red Cross",
      description: "Provide emergency assistance and disaster relief.",
      startDate: "2023-05-01T14:14:50.534Z",
      endDate: "2023-11-30T14:14:50.534Z",
      imageUrl: "https://example.com/image.png",
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
      listingsCount: 200,
    },
    {
      id: "2",
      name: "Red Cross",
      description: "Provide emergency assistance and disaster relief.",
      startDate: "2023-05-01T14:14:50.534Z",
      endDate: "2023-11-30T14:14:50.534Z",
      imageUrl: "https://example.com/image.png",
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
      listingsCount: 200,
    },
    {
      id: "2",
      name: "Red Cross",
      description: "Provide emergency assistance and disaster relief.",
      startDate: "2023-05-01T14:14:50.534Z",
      endDate: "2023-11-30T14:14:50.534Z",
      imageUrl: "https://example.com/image.png",
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
      listingsCount: 200,
    },
    {
      id: "2",
      name: "Red Cross",
      description:
        "Provide emergency assistance and disaster relief. Provide emergency assistance and disaster relief. Provide emergency assistance and disaster relief.",
      startDate: "2023-05-01T14:14:50.534Z",
      endDate: "2023-11-30T14:14:50.534Z",
      imageUrl: "https://example.com/image.png",
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
      listingsCount: 200,
    },
  ];

  const noPastCharitiesObject = [
    {
      id: "1",
      name: "Save the Children",
      description: "Help children in need around the world.",
      startDate: "2024-06-01T14:14:50.534Z",
      endDate: "2024-12-12T14:14:50.534Z",
      imageUrl: "https://example.com/image.png",
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
      listingsCount: 150,
    },
  ];

  it("gets the charities and displays the current charity", () => {
    cy.intercept("GET", "/api/charities", {
      statusCode: 200,
      body: expectedCharitiesObject,
    }).as("charitiesRequest");

    // Wait for the mock request to complete and check its status
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

    // Wait for the mock request to complete and check its status
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

    // Wait for the mock request to complete and check its status
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
