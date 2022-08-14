import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../header/header.service';
import { PopupModalService } from '../popup-modal/popup-modal.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username = "";

  headerId = "header-home";

  @ViewChild("popup") popup;

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService, private headerService: HeaderService) {
    this.headerService.setHeaderId(this.headerId);
  }

  ngOnInit(): void {
    this.getUsername();
  }

  getUsername() {
    this.http.get(
      'http://localhost:8080/api/current_user',
      {
        withCredentials: true
      }
    )
    .subscribe({next: (responseData: {message: string}) => {this.username = responseData.message},
      error: (error) => {this.popupModalService.openPopup(this.popup);},
      complete: () => {}
    });
  }

  onLogout() {
    this.http.get(
      'http://localhost:8080/api/logout',
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
      'http://localhost:8080/api/refresh',
      {
        withCredentials: true
      }
    )
    .subscribe({next: (responseData: {message: string}) => {this.getUsername()},
      error: (error) => {this.onLogout()},
      complete: () => {}
    });
  }

  closePopup() {
    this.onRefresh();
    this.popupModalService.closePopup(this.popup);
  }

}
