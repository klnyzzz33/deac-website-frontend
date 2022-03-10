import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username = "";

  constructor(private http: HttpClient, private router: Router) {}

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
    .subscribe({next: (responseData: { message: string }) => {this.username = responseData.message},
      error: (error) => {},
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
      error: (error) => {},
      complete: () => {}
    });
  }

}
