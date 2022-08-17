import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/popup-modal/popup-modal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {

  errorMessage = null;

  username = "";

  password = "";

  isVerifiedSuccessful = false;

  @ViewChild("popup") popup: PopupModalComponent;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) {
    let currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation != null && currentNavigation.extras["state"] && currentNavigation.extras.state["isVerifiedSuccessful"]) {
      this.isVerifiedSuccessful = true;
    }
  }

  ngAfterViewInit(): void {
    if (this.isVerifiedSuccessful) {
      this.popupModalService.openPopup(this.popup);
    }
  }

  onSubmit(form: NgForm) {
    let data = form.form.value;

    if (form.form.invalid) {
      this.errorMessage = "Login failed";
      return;
    }

    this.http.post(
      'http://localhost:8080/api/user/login',
      data,
      {
        responseType: 'json', 
        withCredentials: true
      }
    )
    .subscribe({next: (responseData) => {this.router.navigate(['/site/dashboard'])},
      error: (error) => {this.errorMessage = error.error},
      complete: () => {}
    });
  }

  onForgotPassword() {
    this.router.navigate(['/forgot']);
  }

  onBack() {
    this.router.navigate(['']);
  }

  onClose() {
    this.popupModalService.closePopup(this.popup);
    this.router.navigate(['login']);
  }

}
