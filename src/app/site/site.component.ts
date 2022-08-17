import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopupModalComponent } from '../popup-modal/popup-modal.component';
import { PopupModalService } from '../popup-modal/popup-modal.service';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.css']
})
export class SiteComponent implements OnInit {

  @ViewChild("popup") popup: PopupModalComponent;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.http.get(
      'http://localhost:8080/api/user/current_user',
      {
        withCredentials: true
      }
    )
    .subscribe({next: () => {},
      error: (error) => {this.popupModalService.openPopup(this.popup)},
      complete: () => {}
    });
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
    .subscribe({next: (responseData: {message: string}) => {},
      error: (error) => {this.onLogout()},
      complete: () => {}
    });
  }

  closePopup() {
    this.onRefresh();
    this.popupModalService.closePopup(this.popup);
  }

}
