import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PopupModalComponent } from '../popup-modal/popup-modal.component';
import { PopupModalService } from '../popup-modal/popup-modal.service';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.css']
})
export class SiteComponent implements AfterViewInit, OnDestroy {

  @ViewChild("popup") popup: PopupModalComponent;

  authenticationChangeSubscription: Subscription;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private authService: AuthService) {
    
  }

  ngAfterViewInit(): void {
    this.popupModalService.setModal(this.popup);
    this.authenticationChangeSubscription = this.authService.getIsTokenExpired().subscribe({
      next: (isTokenExpired: boolean) => {
        if (isTokenExpired) {
          this.popupModalService.openPopup();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.authenticationChangeSubscription.unsubscribe();
  }

  onLogout() {
    this.http.get(
      'http://localhost:8080/api/user/logout',
      {
        withCredentials: true
      }
    )
    .subscribe({next: (responseData) => {this.router.navigate([''])},
      error: (error) => {console.log("Error logging out")},
      complete: () => {}
    });
  }

  onRefresh() {
    this.http.get(
      'http://localhost:8080/api/user/refresh',
      {
        withCredentials: true
      }
    )
    .subscribe({next: () => {},
      error: (error) => {
        console.log("Error refreshing session");
        this.onLogout();
      },
      complete: () => {}
    });
  }

  closePopup() {
    this.onRefresh();
    this.popupModalService.closePopup();
  }

}
