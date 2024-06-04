import App from '../../src/App'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as cypress from "cypress";
// Note when testing this run it as a --component

describe('<App />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<App />)
  })
})