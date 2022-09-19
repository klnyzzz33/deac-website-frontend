let publicKey = "pk_test_51Li3D7IDp80KjNuDc2HE5WqTyC0CS8mwTwQkm0nzcnGBhoYVpuAxnkeefZbaGdnuGrOKaeuDzh0cOjSbUGo4bRgP00YEbX7Jbz";
let stripe = Stripe(publicKey);
let card;

function initializePayment() {
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
    }
    card = elements.create("card", { style: style, hidePostalCode: true });
    card.mount("#card-element");
};

async function makePayment(data) {
    return await stripe.createPaymentMethod("card", card, data)
        .then(function (result) {
            if (result.error) {
                return {
                    error: true,
                    message: result.error.message
                }
            } else {
                return {
                    paymentMethodId: result.paymentMethod.id,
                    saveCard: document.querySelector("#save-card").checked
                };
            }
        });
};

async function orderComplete(clientSecret) {
    return await stripe.retrievePaymentIntent(clientSecret).then(function (result) {
        return result;
    });
};

var handleAction = function (clientSecret) {
    // Show the authentication modal if the PaymentIntent has a status of "requires_action"
    stripe.handleCardAction(clientSecret).then(function (data) {
        if (data.error) {
            showError("Your card was not authenticated, please try again");
        } else if (data.paymentIntent.status === "requires_confirmation") {
            // Card was properly authenticated, we can attempt to confirm the payment again with the same PaymentIntent
            fetch("/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    paymentIntentId: data.paymentIntent.id
                })
            })
                .then(function (result) {
                    return result.json();
                })
                .then(function (json) {
                    if (json.error) {
                        showError(json.error);
                    } else {
                        orderComplete(clientSecret);
                    }
                });
        }
    });
};