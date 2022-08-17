import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements AfterViewInit {

  @ViewChild("defaultTab") defaultTab: ElementRef;

  constructor(private router: Router, private elem: ElementRef, private headerService: HeaderService) {}

  ngAfterViewInit(): void {
    if (!this.headerService.getHeaderTabId()) {
      this.headerService.setHeaderTabId(this.defaultTab.nativeElement.id);
    }
    this.onSelectHeaderTab(this.headerService.getHeaderTabId());
  }

  onSelectHeaderTab(id: string) {
    let elements = this.elem.nativeElement.querySelectorAll('.nav-item');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    document.getElementById(id).parentElement.classList.add("active");
  }

  onNavigate(event: any, destination: String) {
    this.headerService.setHeaderTabId(event.target.id);
    this.onSelectHeaderTab(event.target.id);
    this.router.navigate(["/site/" + destination]);
  }

}
