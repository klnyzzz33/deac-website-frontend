import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, private elem: ElementRef, private headerService: HeaderService) {}

  ngOnInit(): void {
    let elements = this.elem.nativeElement.querySelectorAll('.nav-item');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    document.getElementById(this.headerService.getHeaderId()).parentElement.classList.add("active");
  }

  onNavigate(destination: String) {
    this.router.navigate(["/" + destination]);
  }

}
