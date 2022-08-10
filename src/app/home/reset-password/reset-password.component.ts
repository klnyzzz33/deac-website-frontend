import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  errorMessage = null;

  password = "";
  password_confirm = "";

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {

  }

  onCancel() {

  }

}
