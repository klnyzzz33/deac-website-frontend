import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/popup-modal/popup-modal.service';
import { PageCountComponent } from './page-count/page-count.component';

@Component({
  selector: 'app-news',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit {

  @ViewChild("popup") popup: PopupModalComponent;

  @ViewChild("pagecount") pagecount: PageCountComponent;

  newsList: {
    newsId: Number, 
    title: String, 
    description: String, 
    content: String, 
    author: String, 
    createDate: Number, 
    lastModified: {
      modifyDate: Number,
      modifyAuthor: String
    }
  }[] = [];

  currentPage: number

  entriesPerPage: number = 10;

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
    .subscribe({next: (responseData: {message: string}) => {
      this.pagecount.setUpComponent();
    },
      error: (error) => {this.popupModalService.openPopup(this.popup)},
      complete: () => {}
    });
  }

  setCurrentPage(currentPage: number) {
    this.currentPage = currentPage;
    this.getNews();
  }

  getNews() {
    let params = new HttpParams().set("pageNumber", this.currentPage).set("entriesPerPage", this.entriesPerPage);
    this.http.get(
      'http://localhost:8080/api/news/list',
      {
        withCredentials: true,
        params: params
      }
    )
    .subscribe({next: (responseData: {
      newsId: Number, 
      title: String, 
      description: String, 
      content: String, 
      author: String, 
      createDate: Number, 
      lastModified: {
        modifyDate: Number,
        modifyAuthor: String
      }
    }[]) => {this.newsList = responseData},
      error: (error) => {console.log("Error listing news")},
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
    .subscribe({next: (responseData: {message: string}) => {this.getUser()},
      error: (error) => {
        console.log("Error refreshing session token");
        this.onLogout();
      },
      complete: () => {}
    });
  }

  closePopup() {
    this.onRefresh();
    this.popupModalService.closePopup(this.popup);
  }

  onOpenNews(newsId: number, title: String) {
    this.router.navigate(['/news', title], {
      queryParams: {
        id: newsId
      }
    });
  }

}
