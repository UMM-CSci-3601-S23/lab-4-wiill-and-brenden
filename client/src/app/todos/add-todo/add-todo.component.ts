import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Todo, TodoStatus } from '../todo';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {

  addTodoForm: UntypedFormGroup;

  todo: Todo;


  addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Name is required'},
      {type: 'minlength', message: 'Name must be at least 2 characters long'},
      {type: 'maxlength', message: 'Name cannot be more than 50 characters long'},
      {type: 'existingOwner', message: 'Owner Name has already been taken'}
    ],

    status: [
      {type: 'required', message: 'Status is required'},
      { type: 'pattern', message: 'Status must be either complete, or incomplete' }
    ],

    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: 'Body must be at least 2 characters long'},
      {type: 'maxlength', message: 'Name cannot be more than 1000 characters long'},

    ],

    category: [
      { type: 'required', message: 'Category is required' },
      {type: 'minlength', message: 'Category must be at least 2 characters long'},
      {type: 'maxlength', message: 'Category cannot be more than 50 characters long'},

    ]
  };

  constructor(private fb: UntypedFormBuilder, private todoService: TodoService, private snackBar: MatSnackBar, private router: Router) {
  }

  createForms() {

    // add todo form validations
    this.addTodoForm = this.fb.group({
      // We allow alphanumeric input and limit the length for owner.
      owner: new UntypedFormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        // In the real world you'd want to be very careful about having
        // an upper limit like this because people can sometimes have
        // very long names. This demonstrates that it's possible, though,
        // to have maximum length limits.
        Validators.maxLength(50),
        // (fc) => {
        //   if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
        //     return ({existingName: true});
        //   } else {
        //     return null;
        //   }
        // },
      ])),


      status: new UntypedFormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^(complete|incomplete)$')
      ])),


      body: new UntypedFormControl('', Validators.compose([
        // Validators.required,
        // Validators.minLength(2),
        // Validators.maxLength(1000),
      ])),


      category: new UntypedFormControl('', Validators.compose([
        Validators.required,
        // Validators.minLength(2),
        // Validators.maxLength(50),
      ])),

    });

  }

  ngOnInit() {
    this.createForms();
  }


  submitForm() {

    // eslint-disable-next-line prefer-const
    let todo = this.addTodoForm.value;
    if (todo.status === 'incomplete') {todo.status = false;}
    else {
      todo.status = true;
    }


    this.todoService.addTodo(todo).subscribe({
      next: (newID) => {
        this.snackBar.open(
          `Added todo for ${this.addTodoForm.value.owner}`,
          null,
          { duration: 2000 }
        );
        // this.router.navigate(['/todos/', newID]);
      },
      error: err => {
        this.snackBar.open(
          'Failed to add the todo',
          'OK',
          { duration: 5000 }
        );
      },
      // complete: () => console.log('Add todo completes!')
    });
  }


}
