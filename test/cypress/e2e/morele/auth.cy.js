/**
 * Authentication flows – login & password reset.
 *
 * Credentials are read from cypress.config.js `env` (or overridden via CI env vars).
 * The login flow uses cy.session() (defined in support/commands.js), so the browser
 * session is cached and reused across tests that call cy.login().
 */

describe('Authentication', () => {
  let email;

  beforeEach(() => {
    cy.env(['testEmail']).then((envVars) => {
      email = envVars.testEmail;
    });

    cy.visit('/');
    cy.acceptCookies();
  });

  context('Login', () => {
    it('shows validation error when only the email step is submitted empty', () => {
      cy.contains('Zaloguj się').click();
      cy.url().should('include', '/login');

      // Submit without typing anything – expect an inline error.
      cy.get('button[type="submit"]').filter(':visible').click();
      cy.get('.mv-invalid').should('be.visible');
    });

    it('shows error for invalid credentials', () => {
      cy.contains('Zaloguj się').click();
      cy.url().should('include', '/login');

      cy.get('input[name="_username"]').type('wrong@email.com');
      cy.get('input[name="_password"]').type('WrongPassword!', { log: false });
      cy.get('button[type="submit"]').filter(':visible').click();

      cy.contains('Dane logowania nie są poprawne. Zalogowanie nie powiodło się.')
        .should('be.visible');
    });

    it('logs in successfully with valid credentials', () => {
      // cy.login() caches the session – subsequent specs that call cy.login()
      // will skip the UI flow and restore cookies directly.
      cy.login();
      cy.visit('/');
      cy.get('.h-user-control').should('contain.text', 'Witaj');
    });
    it('logs in successfully with valid credentials shown', () => {
      cy.visit('/');
      cy.acceptCookies();
      cy.login();
      cy.visit('/');
      cy.get('.h-user-control')
        .should('be.visible')
        .realHover();

      cy.get('#header a[href="/logout"]')
        .should('be.visible')
        .click();
      cy.contains('Zaloguj się')

    });
  });

  context('Password reset', () => {
    beforeEach(() => {
      cy.contains('Zaloguj się').click();
      cy.url().should('include', '/login');
    });

    it('navigates to the forgot-password page via link', () => {
      cy.get('a[href="/zapomniane-haslo"]').should('be.visible').click();
      cy.url().should('include', '/zapomniane-haslo');
    });

    it('submits the reset form and confirms the confirmation screen', () => {
      cy.contains("Zaloguj się")
      cy.get('#login_form a[href="/zapomniane-haslo"]').click();
      cy.url().should('include', '/zapomniane-haslo');
      
      cy.get('input[id="reset_password_email"]').type(email);
      cy.get('button[type="submit"]').filter(':visible').click({ force: true });
      
      // Confirmation page should mention the process and the submitted address.
      cy.contains('Przypominanie hasła').should('be.visible');
      cy.get('#resetPassword_email button.btn').click();
      cy.contains(email).should('be.visible');
      
      
    });

    it('returns to the homepage from the confirmation screen', () => {
      cy.contains('Nie pamiętam hasła').click();
      cy.get('input[id="reset_password_email"]').type(email);
      cy.get('button[type="submit"]').filter(':visible').click();

      cy.get('a[href="/"]').contains('Przejdź do strony głównej').click();
      cy.url().should('equal', `${Cypress.config('baseUrl')}/`);
    });
  });
});
