import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

declare function initializePayment(): void;

declare function createPaymentMethod(data: Object): Promise<Object>;

declare function handleAction(clientSecret: string): Promise<Object>;

declare function retrieveOrder(clientSecret: string): Promise<Object>;

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "checkout";

    @ViewChild("checkoutbutton") checkoutButton: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("checkoutbuttontext") checkoutButtonText: ElementRef;

    @ViewChild("carderrors") cardErrors: ElementRef;

    @ViewChild("cardname") cardName: ElementRef;

    savedPaymentMethods: {
        id: string,
        last4: string,
        expMonth: number,
        expYear: number,
        brand: string
    }[] = [];

    constructor(private http: HttpClient, private router: Router, private popupModalService: PopupModalService) { }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        this.listPaymentMethods();
        initializePayment();
    }

    listPaymentMethods() {
        this.http.post(
            'http://localhost:8080/api/payment/list_methods',
            null,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: {
                    id: string,
                    last4: string,
                    expMonth: number,
                    expYear: number,
                    brand: string
                }[]) => {
                    this.savedPaymentMethods = responseData;
                },
                error: (error) => { console.log("Could not list payment methods") },
                complete: () => { }
            });
    }

    onSubmit() {
        let cardholderName = this.cardName.nativeElement.value;
        let data = {
            billing_details: {}
        };
        if (!cardholderName) {
            this.showError("A kártyán szereplő név hiányos vagy érvénytelen.");
            return;
        }
        data["billing_details"]["name"] = cardholderName;
        this.changeLoadingState(true);
        createPaymentMethod(data).then(result => {
            if (!result["error"]) {
                this.makePayment(result);
            } else {
                this.changeLoadingState(false);
                this.showError(result["message"]);
            }
        });
    }

    makePayment(data: Object) {
        this.http.post(
            'http://localhost:8080/api/payment/confirm',
            data,
            {
                responseType: 'json',
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: {
                    clientSecret: string,
                    requiresAction: boolean
                }) => {
                    if (!responseData.requiresAction) {
                        this.changeLoadingState(false);
                        this.completeCheckout(responseData.clientSecret);
                    } else {
                        this.handleAuthentication(responseData.clientSecret);
                    }
                },
                error: (error) => {
                    this.changeLoadingState(false);
                    this.showError(error.error);
                },
                complete: () => { }
            });
    }

    handleAuthentication(clientSecret: string) {
        handleAction(clientSecret).then(result => {
            if (!result["error"]) {
                this.http.post(
                    'http://localhost:8080/api/payment/confirm_after_authenticate',
                    result["paymentIntentId"],
                    {
                        responseType: 'json',
                        withCredentials: true
                    }
                )
                    .subscribe({
                        next: (responseData: {
                            clientSecret: string,
                            requiresAction: boolean
                        }) => {
                            this.changeLoadingState(false);
                            this.completeCheckout(responseData.clientSecret);
                        },
                        error: (error) => {
                            this.changeLoadingState(false);
                            this.showError(error.error);
                        },
                        complete: () => { }
                    });
            } else {
                this.changeLoadingState(false);
                this.showError(result["message"]);
            }
        });
    }

    completeCheckout(clientSecret: string) {
        retrieveOrder(clientSecret).then(result => {
            if (result["paymentIntent"]["status"] == "succeeded") {
                let data = {
                    amount: result["paymentIntent"]["amount"],
                    paymentMethodId: result["paymentIntent"]["payment_method"],
                    paymentIntentId: result["paymentIntent"]["id"]
                }
                this.http.post(
                    'http://localhost:8080/api/payment/save',
                    data,
                    {
                        responseType: 'json',
                        withCredentials: true
                    }
                )
                    .subscribe({
                        next: (responseData) => {
                            this.popupModalService.openPopup(this.popupName);
                        },
                        error: (error) => {
                            console.log("Error saving payment");
                        },
                        complete: () => { }
                    });
            }
        });
    }

    showError(errorMessage: string) {
        this.changeLoadingState(false);
        var error = this.cardErrors.nativeElement;
        error.textContent = errorMessage;
        error.style.display = "block";
        setTimeout(function () {
            error.textContent = "";
            error.style.display = "none";
        }, 5000);
    }

    changeLoadingState(isLoading: boolean) {
        if (isLoading) {
            this.checkoutButton.nativeElement.disabled = true;
            this.spinner.nativeElement.classList.remove("hidden");
            this.checkoutButtonText.nativeElement.classList.add("hidden");
        } else {
            this.checkoutButton.nativeElement.disabled = false;
            this.spinner.nativeElement.classList.add("hidden");
            this.checkoutButtonText.nativeElement.classList.remove("hidden");
        }
    }

    onNavigateToProfile() {
        this.popupModalService.closePopup(this.popupName);
        this.router.navigate(['/site/profile']);
    }

    closePopup() {
        this.popupModalService.closePopup(this.popupName);
        window.location.reload();
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
