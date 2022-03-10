import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  errorMessage = null;

  username = "";
  email = "";
  password = "";

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {
    let data = form.form.value;
    data["roles"] = ["ROLE_CLIENT"];
    
    if (form.form.invalid) {
      this.errorMessage = "Registration failed";
      return;
    }

    this.http.post(
      'http://localhost:8080/api/register',
      data,
      {responseType: 'text'}
    )
    .subscribe({next: (responseData) => {this.router.navigate(['login'])},
      error: (error) => {this.errorMessage = error.error},
      complete: () => {}
    });
  }

  onBack() {
    this.router.navigate(['']);
  }

}
