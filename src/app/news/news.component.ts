import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopupModalService } from '../popup-modal/popup-modal.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  @ViewChild("popup") popup;

  newsList: {
    newsId: Number, 
    title: String, 
    content: String, 
    author: String, 
    createDate: Number, 
    lastModified: {
      modifyDate: Number,
      modifyAuthor: String
    }
  }[] = [];

  constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) {}

  ngOnInit(): void {
    this.getUsername();
    this.getNews();
  }

  getUsername() {
    this.http.get(
      'http://localhost:8080/api/current_user',
      {
        withCredentials: true
      }
    )
    .subscribe({next: (responseData: {message: string}) => {},
      error: (error) => {this.popupModalService.openPopup(this.popup);},
      complete: () => {}
    });
  }

  getNews() {
    this.http.get(
      'http://localhost:8080/api/news/list',
      {
        withCredentials: true
      }
    )
    .subscribe({next: (responseData: {
      newsId: Number, 
      title: String, 
      content: String, 
      author: String, 
      createDate: Number, 
      lastModified: {
        modifyDate: Number,
        modifyAuthor: String
      }
    }[]) => {this.newsList = responseData;console.log(this.newsList)},
      error: (error) => {console.log("Error listing news")},
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
    .subscribe({next: (responseData: {message: string}) => {this.getUsername();},
      error: (error) => {console.log("Error refreshing session token")},
      complete: () => {}
    });
  }

  closePopup() {
    this.onRefresh();
    this.popupModalService.closePopup(this.popup);
  }

}
