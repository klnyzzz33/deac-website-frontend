import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  errorMessage = null;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {
    let data = form.form.value;

    this.http.post(
      'http://localhost:8080/api/login',
      data,
      {
        responseType: 'json', 
        withCredentials: true
      }
    )
    .subscribe({next: (responseData) => {this.router.navigate(['register'])},
      error: (error) => {this.errorMessage = error.error},
      complete: () => {}
    });
  }

  onBack() {
    this.router.navigate(['']);
  }

}
