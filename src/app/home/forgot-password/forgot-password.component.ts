import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  email = "";

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {
    
  }

  onBack() {
    this.router.navigate(['/login']);
  }

}
