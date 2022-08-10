import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalService } from 'src/app/popup-modal/popup-modal.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  errorMessage = null;

  password = "";
  password_confirm = "";

  @ViewChild("popup") popup;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) {}

  onSubmit(form: NgForm) {
    let data = form.form.value;

    if (form.form.invalid) {
      this.errorMessage = "Password reset failed";
      return;
    }

    this.http.post(
      'http://localhost:8080/api/reset',
      {token: "token", password: data.password},
      {responseType: 'json'}
    )
    .subscribe({next: (responseData) => {this.popupModalService.openPopup(this.popup)},
      error: (error) => {this.errorMessage = error.error},
      complete: () => {}
    });
  }

  onCancel() {
    this.router.navigate(['']);
  }

  onLogin() {
    this.popupModalService.closePopup(this.popup);
    this.router.navigate(['login']);
  }

}
