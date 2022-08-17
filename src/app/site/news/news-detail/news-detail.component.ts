import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/popup-modal/popup-modal.service';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.css']
})
export class NewsDetailComponent implements OnInit {

  @ViewChild("popup") popup: PopupModalComponent;

  newsId: number;

  newsDetails: {
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
  };

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService) {}

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.newsId = params.id;
      }
    );
    this.getNews();
  }

  getNews() {
    if (!this.newsId) {
      this.router.navigate(['news']);
      return;
    }

    let params = new HttpParams().set("id", this.newsId);
    this.http.get(
      'http://localhost:8080/api/news/open',
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
    }) => {this.newsDetails = responseData},
      error: (error) => {
        console.log("Error getting news details");
        if (error.error.message == "Expired token") {
          this.popupModalService.openPopup(this.popup);
        }
      },
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
    .subscribe({next: (responseData: {message: string}) => {},
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

}
