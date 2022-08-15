import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-page-count',
  templateUrl: './page-count.component.html',
  styleUrls: ['./page-count.component.css']
})
export class PageCountComponent implements OnInit {

  numberOfEntries: number;

  entriesPerPage: number = 10;

  currentPage: number;

  numberOfPages: number;

  @Output() currentPageChangeEvent = new EventEmitter<number>();

  constructor(private http: HttpClient, private elem: ElementRef) {}

  ngOnInit(): void {
    this.getNumberOfPages();
    if (!localStorage.getItem("pageCounter")) {
      localStorage.setItem("pageCounter", "1");
    }
    this.currentPage = Number(localStorage.getItem("pageCounter"));
    this.currentPageChangeEvent.emit(this.currentPage);
  }

  getNumberOfPages() {
    this.http.get(
      'http://localhost:8080/api/news/count',
      {
        withCredentials: true
      }
    )
    .subscribe({next: (responseData: number) => {
      this.numberOfEntries = responseData;
      this.numberOfPages = Math.ceil(this.numberOfEntries / this.entriesPerPage);
    },
      error: (error) => {console.log("Error getting number of pages")},
      complete: () => {}
    });
  }

  createRange() {
    return new Array(this.numberOfPages);
  }

  onSwitchPages(event: any) {
    localStorage.setItem("pageCounter", event.target.innerText);
    this.currentPage = event.target.innerText;
    this.currentPageChangeEvent.emit(this.currentPage);
  }

}
