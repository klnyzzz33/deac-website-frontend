import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Form, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'deac-website-frontend';

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
