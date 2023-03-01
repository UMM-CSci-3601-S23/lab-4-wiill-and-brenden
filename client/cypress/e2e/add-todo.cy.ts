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
    page.getFormField('body').type('ex non viva la vida');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('Video Games');
    page.addTodoButton().should('be.disabled');
    cy.get('mat-select[formControlName=status]').click().get('mat-option').contains('complete').click();
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the name field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid name inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type('This is a very long name that goes beyond the 50 character limit').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid name should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');



    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the email field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    // Some more tests for various invalid email inputs
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    page.getFormField('body').clear().type('valid body example').blur();
    cy.get('[data-test=emailError]').should('not.exist');

       // Before doing anything there shouldn't be an error
       cy.get('[data-test=categoryError]').should('not.exist');
       // Just clicking the email field without entering anything should cause an error message
       page.getFormField('category').click().blur();
       // Some more tests for various invalid email inputs
       cy.get('[data-test=categoryError]').should('exist').and('be.visible');
       page.getFormField('category').clear().type('valid category').blur();
       cy.get('[data-test=emailError]').should('not.exist');




        // Just clicking the status field without entering anything should cause an error message

        cy.get('mat-select[formControlName=status]').click().get('mat-option').contains('complete').click();
        cy.get('[data-test=ageError]').should('not.exist');
        cy.get('mat-select[formControlName=status]').click().get('mat-option').contains('incomplete').click();
        cy.get('[data-test=ageError]').should('not.exist');
  });

  describe('Adding a new todo', () => {

    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test Todo',
        status: 'complete',
        body: 'viva la vida',
        category: 'Testing',

      };

      page.addTodo(todo);


      cy.url()
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);

      // The new user should have all the same attributes as we entered
      cy.get('.todo-card-owner').should('have.text', todo.owner);
      cy.get('.todo-card-body').should('have.text', todo.body);
      cy.get('.todo-card-category').should('have.text', todo.category);


    });

    it('Should fail with no body', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test User',
        status: 'complete',
        body: '',
        category: 'Videos',

      };

      page.addTodo(todo);


      // We should have stayed on the new todo page
      cy.url()
        .should('not.match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('match', /\/todos\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('owner').should('have.value', todo.owner);
      page.getFormField('category').should('have.value', todo.category);
    });
  });

});
