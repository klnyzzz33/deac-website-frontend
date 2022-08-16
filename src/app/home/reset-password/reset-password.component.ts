import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/popup-modal/popup-modal.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  errorMessage = null;

  password = "";
  
  password_confirm = "";

  token = "";

  @ViewChild("popup") popup: PopupModalComponent;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService) {}

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.token = params.token;
      }
    );
  }

  onSubmit(form: NgForm) {
    let data = form.form.value;

    if (form.form.invalid || !this.token) {
      this.errorMessage = "Password reset failed";
      return;
    }

    this.http.post(
      'http://localhost:8080/api/user/reset',
      {token: this.token, password: data.password},
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
