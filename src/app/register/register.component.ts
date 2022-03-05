import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm) {
    let data = form.form.value;
    data["roles"] = ["ROLE_CLIENT"];

    this.http.post(
      'http://localhost:8080/api/register',
      data,
      {responseType: 'text'}
    )
    .subscribe(responseData => {
      console.log(responseData);
    });
  }

}
