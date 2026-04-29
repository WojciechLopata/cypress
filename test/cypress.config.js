module.exports = {
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'https://www.morele.net',
    viewportWidth: 1600,
    viewportHeight: 1200,
    defaultCommandTimeout: 10000,
    scrollBehavior: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  // Credentials & test data – override via environment variables in CI:
  //   CYPRESS_TEST_EMAIL=... CYPRESS_TEST_PASSWORD=... npx cypress run
  env: {
    testEmail: 'ldhrnxsnqepjytqqao@vtmpj.net',
    testPassword: 'String1!',
  },
};
