import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { myAnimations } from 'src/app/shared/animations/animations';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';

declare function initializeStripe(locale: string): void;

declare function initializePayment(): void;

declare function createPaymentMethod(data: Object): Promise<Object>;

declare function handleAction(clientSecret: string): Promise<Object>;

declare function retrieveOrder(clientSecret: string): Promise<Object>;

declare function initializePaypal(items: {
    monthlyTransactionReceiptMonth: string,
    amount: number
}[]): void;

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
    animations: [
        myAnimations.appear,
        myAnimations.toggleOnOff,
        myAnimations.slideIn,
        myAnimations.slideInList
    ]
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("popup") popup: PopupModalComponent;

    popupName = "checkout";

    @ViewChild("checkoutbutton") checkoutButton: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("checkoutbuttontext") checkoutButtonText: ElementRef;

    @ViewChild("carderrors") cardErrors: ElementRef;

    @ViewChild("cardname") cardName: ElementRef;

    @ViewChild("paypalbutton") paypalButton: ElementRef;

    orderInfo: {
        items: {
            monthlyTransactionReceiptMonth: string,
            amount: number
        }[],
        currency: string,
        total: number
    } = {
            items: [],
            currency: null,
            total: 0
        };

    savedPaymentMethods: {
        id: string,
        last4: string,
        expMonth: number,
        expYear: number,
        brand: string,
        defaultCard: boolean
    }[] = [];

    isAddNewCardMode = false;

    selectedSavedPaymentMethod = null;

    isEditSavedPaymentMethodMode = false;

    defaultPaymentMethod = null;

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private popupModalService: PopupModalService, private changeDetectorRef: ChangeDetectorRef, private translate: TranslateService) { }

    ngOnInit(): void {
        initializeStripe(this.translate.currentLang);
    }

    ngAfterViewInit(): void {
        this.popupModalService.setModal(this.popupName, this.popup);
        let success = null;
        this.route.queryParams
            .subscribe(params => {
                success = params.success;
            });
        if (success == "true") {
            this.listPaymentMethods();
            initializePaypal(this.orderInfo.items);
            this.popupModalService.openPopup(this.popupName);
        } else {
            this.getCheckoutInfo();
        }
    }

    getCheckoutInfo() {
        this.http.post(
            'http://localhost:8080/api/payment/checkout_info',
            null,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: {
                    items: {
                        monthlyTransactionReceiptMonth: string,
                        amount: number
                    }[],
                    currency: string
                }) => {
                    let total = 0;
                    for (var i = 0; i < responseData.items.length; i++) {
                        total += responseData.items[i].amount;
                    }
                    this.orderInfo = {
                        items: responseData.items,
                        currency: responseData.currency,
                        total: total
                    };
                    this.listPaymentMethods();
                    initializePaypal(this.orderInfo.items);
                },
                error: (error) => { this.router.navigate(['/site/profile']) },
                complete: () => { }
            });
    }

    listPaymentMethods() {
        this.http.post(
            'http://localhost:8080/api/payment/stripe/list_methods',
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
                    brand: string,
                    defaultCard: boolean
                }[]) => {
                    this.savedPaymentMethods = responseData;
                    for (var i = 0; i < this.savedPaymentMethods.length; i++) {
                        if (this.savedPaymentMethods[i].defaultCard) {
                            this.defaultPaymentMethod = this.savedPaymentMethods[i].id;
                            this.selectedSavedPaymentMethod = this.defaultPaymentMethod;
                        }
                    }
                },
                error: (error) => { console.log("Could not list payment methods") },
                complete: () => { }
            });
    }

    handleSavedPaymentMethodChange(event: any, id: string) {
        if (event.target.checked) {
            this.selectedSavedPaymentMethod = id;
        }
    }

    onToggleEditSavedPaymentMethods() {
        this.isEditSavedPaymentMethodMode = !this.isEditSavedPaymentMethodMode;
    }

    onSetPrimaryPaymentMethod(id: string) {
        this.http.post(
            'http://localhost:8080/api/payment/stripe/saved/default',
            id,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseMessage: { message: string }) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Could not set default payment method") },
                complete: () => { }
            });
    }

    onDeletePaymentMethod(id: string) {
        this.http.post(
            'http://localhost:8080/api/payment/stripe/saved/remove',
            id,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseMessage: { message: string }) => {
                    window.location.reload();
                },
                error: (error) => { console.log("Could not delete payment method") },
                complete: () => { }
            });
    }

    onPayWithSavedPaymentMethod() {
        let data = {
            items: this.orderInfo.items,
            paymentMethodId: this.selectedSavedPaymentMethod,
            saveCard: false
        };
        this.changeLoadingState(true);
        this.makePayment(data, true);
    }

    showAddNewCardForm() {
        this.isAddNewCardMode = true;
        this.changeDetectorRef.detectChanges();
        initializePayment();
    }

    hideAddNewCardForm() {
        this.isAddNewCardMode = false;
        this.selectedSavedPaymentMethod = this.defaultPaymentMethod;
        this.changeDetectorRef.detectChanges();
        initializePaypal(this.orderInfo.items);
    }

    onSubmit() {
        let cardholderName = this.cardName.nativeElement.value;
        let data = {
            billing_details: {},
            metadata: {}
        };
        if (!cardholderName) {
            this.translate.get("site.profile.checkout.error.checkout")
                .subscribe((value: string) => {
                    this.showError(value);
                });
            return;
        }
        data["billing_details"]["name"] = cardholderName;
        data["metadata"]["lastUsed"] = new Date().getTime();
        this.changeLoadingState(true);
        createPaymentMethod(data).then(result => {
            if (!result["error"]) {
                result["items"] = this.orderInfo.items;
                this.makePayment(result, false);
            } else {
                this.changeLoadingState(false);
                this.showError(result["message"]);
            }
        });
    }

    makePayment(data: Object, payWithSavedPaymentMethod: boolean) {
        let endPoint: string;
        if (!payWithSavedPaymentMethod) {
            endPoint = "http://localhost:8080/api/payment/stripe/confirm";
        } else {
            endPoint = "http://localhost:8080/api/payment/stripe/saved/confirm";
        }
        this.http.post(
            endPoint,
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
                    'http://localhost:8080/api/payment/stripe/confirm_after_authenticate',
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
                this.http.post(
                    'http://localhost:8080/api/payment/stripe/save',
                    result["paymentIntent"]["id"],
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

    onHoverPaypalButton(isHover: boolean) {
        if (isHover) {
            this.paypalButton.nativeElement.style.filter = "contrast(130%) blur(0.6px)";
        } else {
            this.paypalButton.nativeElement.style.filter = "none";
        }
    }

    ngOnDestroy(): void {
        this.popupModalService.unsetModal(this.popupName);
    }

}
