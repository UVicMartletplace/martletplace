# Frontend

Below is information for how to do some of the functionalities of the frontend tech stack

| Tool | Description | Quick Video Resource | Docs |
|------|--------------|-------------------------|-------|
| Vite('veet') | JS bundler and React build tool | [Vite in 100 Seconds](https://youtu.be/KCrXgy8qtjM?si=Rb3QLsWwmCsb4jNW) | [Vite docs](https://vitejs.dev/guide/) |
| Axios | Easier replacement for fetch, </br>HTTP client for React applications | [Axios js tutorial in 120 seconds](https://youtu.be/j284YeATTAI?si=omcbcIO_XZNCg686) | [Axios docs](https://axios-http.com/docs/intro) |
| Cypress | Testing framework for Web Apps | [Cypress in 100 Seconds](https://youtu.be/BQqzfHQkREo?si=k7xSqYEGL7uZfMjj) | [Cypress docs](https://docs.cypress.io/guides/getting-started/opening-the-app) |
| Typescript(TS) | JS but more fancy with 🎩 types | [TypeScript in 100 Seconds](https://www.youtube.com/watch?v=zQnBQ4tB3ZA) | [TypeScript Docs](https://www.typescriptlang.org/docs/handbook/intro.html) and</br>[TS for JS Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) |
| Act | Local Github Actions Testing | [Coding Short: Test Your Github Actions Locally with Act](https://youtu.be/7xfDpoEBp60?si=LfUtVBykHIsfJOqB)</br>*Quickest one I could find* | [Act docs](https://nektosact.com/introduction.html) |

## Dependency Installation

To install all the required packages, run the following 
```shell
npm install
```

If you're having issues with the dependencies, you can try a clean install with `ci`
```shell
npm ci
```

## Cypress Testing
In order to start cypress' interactive testing, make sure you're in the `apps/frontend` directory and run
```shell
npx cypress open
```

### Run all tests with no coverage test
Run this in order to run all the component tests
```shell
npx cypress run --component
```

Run this in order to run all the e2e tests
```shell
npx cypress run
```

### Run all tests with coverage summary
The following are for your convince, they should bundle coverage and testing into one command

*Windows Command*
```shell
npx cypress run --component; npx nyc report --reporter=text-summary
```

*Bash/Apple Command*
```shell
npx cypress run --component && npx nyc report --reporter=text-summary
```

### Run all tests with html output
The following are for your convince, they should bundle coverage and testing into one command and allow for
a more interactive experience for viewing what has run and what has not.
See coverage/index.html for the results of this test

*Windows Command*
```shell
npx cypress run --component; npx nyc report --reporter=html; ECHO See coverage/index.html for coverage
```

*Bash/Apple Command*
```shell
npx cypress run --component && npx nyc report --reporter=html && ECHO See coverage/index.html for coverage
```

---
#### These scripts below should automatically open
The following should work to run the tests, and then open them in your default html program(often your browser)

*Windows Command*
```shell
npx cypress run --component; npx nyc report --reporter=html; start coverage/index.html
```

*Apple Command*
```shell
npx cypress run --component && npx nyc report --reporter=html && open coverage/index.html
```

*Linux Command*
```shell
npx cypress run --component && npx nyc report --reporter=html && xdg-open coverage/index.html
```


### Get coverage separately 
The following are for if you would like to get the coverage for the latest test, you may need this if you're using the GUI
```shell
npx nyc report --reporter=text-summary
```

```shell
npx nyc report --reporter=html
```

## 