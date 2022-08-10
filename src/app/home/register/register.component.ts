import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalService } from 'src/app/popup-modal/popup-modal.service';

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
  password_confirm = "";

  @ViewChild("popup") popup;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) {}

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
      {responseType: 'json'}
    )
    .subscribe({next: (responseData) => {this.popupModalService.openPopup(this.popup)},
      error: (error) => {this.errorMessage = error.error},
      complete: () => {}
    });
  }

  onBack() {
    this.router.navigate(['']);
  }

  onLogin() {
    this.popupModalService.closePopup(this.popup);
    this.router.navigate(['login']);
  }

}
