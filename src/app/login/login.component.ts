import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private http: HttpClient) {}

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
    .subscribe({next: (responseData) => {console.log(responseData)},
      error: (error) => {console.log(error)},
      complete: () => {}
    });
  }

}
