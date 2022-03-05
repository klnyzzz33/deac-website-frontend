import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  showHomeScreen = true;

  constructor(private router: Router) {}

  onLogin() {
    this.showHomeScreen = false;
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.showHomeScreen = false;
    this.router.navigate(['/register']);
  }

}