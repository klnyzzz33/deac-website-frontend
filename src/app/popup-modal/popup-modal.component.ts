import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-popup-modal',
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PopupModalComponent implements OnInit {

  private element: any;

  constructor(private elem: ElementRef) {
    this.element = elem.nativeElement;
  }

  ngOnInit(): void {
  }

  open(): void {
    this.element.style.display = 'block';
    //document.body.classList.add('jw-modal-open');
  }

  close(): void {
    this.element.style.display = 'none';
    //document.body.classList.remove('jw-modal-open');
  }

}
