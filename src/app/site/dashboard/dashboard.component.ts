import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopupModalComponent } from '../../popup-modal/popup-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username = "";

  @ViewChild("popup") popup: PopupModalComponent;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
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

}
