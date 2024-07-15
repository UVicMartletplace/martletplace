import UserProvider from "../../src/contexts/UserProvider.tsx";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CreateCharity from "../../src/pages/CreateCharity.tsx";

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
    //cy.contains("Charity").should("be.visible");
    cy.pause();
  });
});
