describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost");
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[href="/user/signup"]').click();
    cy.get("#\\:r1\\:").clear("te");
    cy.get("#\\:r1\\:").type("test@uvic.ca");
    cy.get("#\\:r3\\:").clear("te");
    cy.get("#\\:r3\\:").type("test");
    cy.get("#\\:r5\\:").clear("tes");
    cy.get("#\\:r5\\:").type("test");
    cy.get("#\\:r7\\:").clear("Q");
    cy.get("#\\:r7\\:").type("Qwert123!");
    cy.get(".css-13qtxxq > .MuiButtonBase-root").click();
    cy.get("#continue-button").click();
    cy.get("#email-input").clear("t");
    cy.get("#email-input").type("test@uvic.ca");
    cy.get("#password-input").clear("Q");
    cy.get("#password-input").type("Qwert123!");
    cy.get(".css-g141bx > .MuiBox-root > :nth-child(3)").click();
    cy.get("#totpCode").clear();
    cy.get("#totpCode").type("123456");
    cy.get(".MuiButtonBase-root").click();
    cy.get(".MuiGrid-grid-xs-1 > .MuiButtonBase-root").click();
    cy.get(".MuiList-root > :nth-child(4)").click();
    cy.get("#field-title").clear("T");
    cy.get("#field-title").type("Test Listing");
    cy.get("#field-description").click();
    cy.get("#field-price").clear("1");
    cy.get("#field-price").type("100");
    cy.get("#charity-checkbox").check();
    cy.get("#submit-button").click();
    cy.get(".MuiGrid-root > img").click();
    cy.get("#message_button").click();
    cy.get("#status-button").click();
    cy.get("#submit-button").click();
    cy.get(":nth-child(2) > .MuiButtonBase-root").click();
    cy.get("#outlined-basic").clear("b");
    cy.get("#outlined-basic").type("banana{enter}");
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get(
      ".MuiGrid-spacing-xs-2 > :nth-child(1) > .MuiButtonBase-root"
    ).click();
    cy.get(".css-1dt9k4s > .MuiBox-root").click();
    cy.get("#charitiesSwitch").check();
    /* ==== End Cypress Studio ==== */
  });
});
