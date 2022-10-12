let publicKey = "pk_test_51Li3D7IDp80KjNuDc2HE5WqTyC0CS8mwTwQkm0nzcnGBhoYVpuAxnkeefZbaGdnuGrOKaeuDzh0cOjSbUGo4bRgP00YEbX7Jbz";
let stripe
let card;

function initializePayment(locale) {
    stripe = Stripe(publicKey, { locale: locale });
    setupElements();
}

function setupElements() {
    var elements = stripe.elements();
    var style = {
        base: {
            fontSize: '16px',
            color: 'black',
            fontFamily: '\'Montserrat\', sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#b5b5b5',
            },
            letterSpacing: '1px'
        },
        complete: {
            iconColor: 'green',
            color: 'green',
        },
        invalid: {
            iconColor: 'red',
            color: 'red',
        },
    };
    card = elements.create("card", { style: style, hidePostalCode: true });
    card.mount("#card-element");
};

async function createPaymentMethod(data) {
    return await stripe.createPaymentMethod("card", card, data)
        .then(function (result) {
            if (result.error) {
                return {
                    error: true,
                    message: result.error.message
                };
            } else {
                return {
                    paymentMethodId: result.paymentMethod.id,
                    saveCard: document.querySelector("#save-card").checked
                };
            }
        });
};

async function handleAction(clientSecret) {
    return await stripe.handleCardAction(clientSecret).then(function (data) {
        if (data.error) {
            return {
                error: true,
                message: "Authentication failed, please try again"
            };
        } else if (data.paymentIntent.status === "requires_confirmation") {
            return {
                paymentIntentId: data.paymentIntent.id
            };
        }
    });
};

async function retrieveOrder(clientSecret) {
    return await stripe.retrievePaymentIntent(clientSecret).then(function (result) {
        return result;
    });
};

/* --------------------
-----------------------
---------------------*/

async function initializePaypal(items) {
    await paypal.Buttons({
        style: {
            color: "gold",
            size: "responsive",
            height: 40
        },
        createOrder: async function (data, actions) {
            const response = await fetch("http://localhost:8080/api/payment/paypal/order", {
                method: "post",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(items)
            });
            const order = await response.json();
            return order.id;
        },
        onApprove: async function (data, actions) {
            var response = await fetch("http://localhost:8080/api/payment/paypal/confirm", {
                method: "post",
                credentials: "include",
                body: data.orderID
            });
            const orderData = await response.json();
            await fetch("http://localhost:8080/api/payment/paypal/save", {
                method: "post",
                credentials: "include",
                body: orderData.id
            })
                .then(result => {
                    if (result.ok) {
                        actions.redirect("http://localhost:4200/site/profile/checkout?success=true");
                    } else {
                        return result.text().then(errorMessage => {
                            throw new Error(errorMessage);
                        });
                    }
                })
                .catch(error => {
                    console.log("Error saving payment");
                });
        },
    })
        .render("#paypal-button-container");
}