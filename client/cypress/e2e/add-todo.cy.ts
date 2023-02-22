import { Todo } from 'src/app/todos/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD USER button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('status').select('complete');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('ex non viva la vida');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('Video Games');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=nameError]').should('not.exist');
    // Just clicking the name field without entering anything should cause an error message
    page.getFormField('name').click().blur();
    cy.get('[data-test=nameError]').should('exist').and('be.visible');
    // Some more tests for various invalid name inputs
    page.getFormField('name').type('J').blur();
    cy.get('[data-test=nameError]').should('exist').and('be.visible');
    page.getFormField('name').clear().type('This is a very long name that goes beyond the 50 character limit').blur();
    cy.get('[data-test=nameError]').should('exist').and('be.visible');
    // Entering a valid name should remove the error.
    page.getFormField('name').clear().type('John Smith').blur();
    cy.get('[data-test=nameError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ageError]').should('not.exist');
    // Just clicking the age field without entering anything should cause an error message
    page.getFormField('age').click().blur();
    // Some more tests for various invalid age inputs
    cy.get('[data-test=ageError]').should('exist').and('be.visible');
    page.getFormField('age').type('5').blur();
    cy.get('[data-test=ageError]').should('exist').and('be.visible');
    page.getFormField('age').clear().type('500').blur();
    cy.get('[data-test=ageError]').should('exist').and('be.visible');
    page.getFormField('age').clear().type('asd').blur();
    cy.get('[data-test=ageError]').should('exist').and('be.visible');
    // Entering a valid age should remove the error.
    page.getFormField('age').clear().type('25').blur();
    cy.get('[data-test=ageError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=emailError]').should('not.exist');
    // Just clicking the email field without entering anything should cause an error message
    page.getFormField('email').click().blur();
    // Some more tests for various invalid email inputs
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    page.getFormField('email').type('asd').blur();
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    page.getFormField('email').clear().type('@example.com').blur();
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    // Entering a valid email should remove the error.
    page.getFormField('email').clear().type('user@example.com').blur();
    cy.get('[data-test=emailError]').should('not.exist');
  });

  describe('Adding a new todo', () => {

    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test User',
        status: 'complete',
        body: 'viva la vida',
        category: 'Videos',

      };

      page.addTodo(todo);

      // New URL should end in the 24 hex character Mongo ID of the newly added user
      cy.url()
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);

      // The new user should have all the same attributes as we entered
      cy.get('.todo-card-owner').should('have.text', todo.owner);
      cy.get('.todo-card-status').should('have.text', todo.status);
      cy.get('.todo-card-body').should('have.text', todo.body);
      cy.get('.todo-card-category').should('have.text', todo.category);

      // We should see the confirmation message at the bottom of the screen
      page.getSnackBar().should('contain', `Added todo ${todo.owner}`);
    });

    it('Should fail with no company', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test User',
        status: 'complete',
        body: 'viva la vida',
        category: 'Videos',

      };

      page.addTodo(todo);

      // We should get an error message
      page.getSnackBar().should('contain', `Failed to add the todo`);

      // We should have stayed on the new user page
      cy.url()
        .should('not.match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('match', /\/todos\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('owner').should('have.value', todo.owner);
      page.getFormField('status').should('have.value', todo.status);
      page.getFormField('body').should('have.value', todo.body);
      page.getFormField('category').should('contain', 'Videos');
    });
  });

});
