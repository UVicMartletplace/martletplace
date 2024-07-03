import Spinner from '../../src/components/Spinner'

const errorText = "We've got an error";

describe('<Spinner />', () => {
  beforeEach(()=>{
    cy.mount(<Spinner text={errorText} />)
  })
  it('renders', () => {
    cy.contains("Hang with us").should("be.visible");
  })
  it("has the correct values", () => {
    cy.contains(errorText).should("be.visible");
  })
})