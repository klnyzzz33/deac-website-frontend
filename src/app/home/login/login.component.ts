import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  errorMessage = null;

  username = "";

  password = "";

  isVerifiedSuccessful = null;

  @ViewChild("popup") popup: PopupModalComponent;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) {
    let currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation != null && currentNavigation.extras["state"]) {
      if (currentNavigation.extras.state["isVerifiedSuccessful"]) {
        this.isVerifiedSuccessful = true;
      } else if (currentNavigation.extras.state.isVerifiedSuccessful === false) {
        this.isVerifiedSuccessful = false;
      }
    }
  }

  ngOnInit(): void {
    if (this.isVerifiedSuccessful === false) {
      this.errorMessage = "Verification failed";
    }
  }

  ngAfterViewInit(): void {
    this.popupModalService.setModal(this.popup);
    if (this.isVerifiedSuccessful) {
      this.popupModalService.openPopup();
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
    .subscribe({next: (responseData) => {
      localStorage.clear();
      this.router.navigate(['/site/dashboard']);
    },
      error: (error) => {this.errorMessage = error.error},
      complete: () => {}
    });
  }

  onForgotPassword() {
    this.router.navigate(['forgot']);
  }

  onBack() {
    this.router.navigate(['']);
  }

  onClose() {
    this.popupModalService.closePopup();
    this.router.navigate(['login']);
  }

}
