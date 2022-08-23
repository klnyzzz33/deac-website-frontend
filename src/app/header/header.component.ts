import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements AfterViewInit {

  @ViewChild("defaultTab") defaultTab: ElementRef;

  constructor(private router: Router, private elem: ElementRef) {}

  ngAfterViewInit(): void {
    let segments = this.router.parseUrl(this.router.url).root.children[PRIMARY_OUTLET].segments;
    this.onSelectHeaderTab("header-" + segments[1].path);
  }

  onSelectHeaderTab(id: string) {
    let elements = this.elem.nativeElement.querySelectorAll('.nav-item');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    document.getElementById(id).parentElement.classList.add("active");
  }

  onNavigate(event: any, destination: String) {
    this.onSelectHeaderTab(event.target.id);
    this.router.navigate(["/site/" + destination]);
  }

}
