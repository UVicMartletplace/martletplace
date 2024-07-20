import UserProvider from "../../src/contexts/UserProvider.tsx";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CreateCharity from "../../src/pages/CreateCharity.tsx";

const expectedBody = {
  name: "Save the whales",
  description: "This charity saves whales",
  startDate: "2024-07-20T00:00:00.000Z",
  endDate: "2024-08-20T00:00:00.000Z",
  imageUrl: "https://picsum.photos/200/300",
  organizations: [
    {
      name: "Google",
      logoUrl: "https://picsum.photos/200/300",
      donated: 10000,
      receiving: false,
    },
    {
      name: "Jim's Wildlife Rescue",
      logoUrl: "https://picsum.photos/200/300",
      donated: 0,
      receiving: true,
    },
  ],
};

describe("CreateCharity", () => {
  beforeEach(() => {
    cy.mount(
      <UserProvider>
        <MemoryRouter initialEntries={[`/charity/new`]}>
          <Routes>
            <Route path="/charity/new" element={<CreateCharity />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>,
    );
    cy.intercept("POST", "/api/images", {
      statusCode: 201,
      body: { url: "https://picsum.photos/200/300" },
    }).as("uploadImages");

    cy.intercept("POST", "/api/charities", {
      statusCode: 201,
    }).as("postCharity");
    cy.viewport(1280, 720);
  });
  it("renders", () => {
    cy.contains("Create Charity").should("be.visible");
    cy.pause();
  });
  it("submits a charity correctly", () => {
    cy.get("#charity-title").type("Save the whales");
    cy.get("#charity-description").type("This charity saves whales");
    cy.get("#upload-logo-input").attachFile([
      "../../src/images/test_image1.jpg",
    ]);
    cy.get("#charity-date").type("2024-07-20");

    cy.get("#add-organization").click();
    cy.get("#org-title-0").type("Google");
    cy.get("#org-donation-0").type("10000");
    cy.get("#upload-input-0").attachFile(["../../src/images/test_image2.jpg"]);
    cy.get("#add-organization").click();
    cy.get("#org-title-1").type("Jim's Wildlife Rescue");
    cy.get("#upload-input-1").attachFile(["../../src/images/test_image3.jpg"]);
    cy.get("#org-received-1").click();
    cy.get("#submit-button").click();

    cy.wait("@postCharity").then((interception) => {
      const requestBody = interception.request.body;
      cy.log("Request Body", requestBody);
      cy.log("Expected Body", expectedBody);
      expect(requestBody).to.deep.equal(expectedBody);
    });
  });
});
