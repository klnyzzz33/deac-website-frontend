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

function initializePaypal() {
    paypal.Buttons({
        // Sets up the transaction when a payment button is clicked
        createOrder: function (data, actions) {
            return fetch("/api/orders", {
                method: "post",
                // use the "body" param to optionally pass additional order information
                // like product ids or amount
            })
                .then((response) => response.json())
                .then((order) => order.id);
        },
        // Finalize the transaction after payer approval
        onApprove: function (data, actions) {
            return fetch(`/api/orders/${data.orderID}/capture`, {
                method: "post",
            })
                .then((response) => response.json())
                .then((orderData) => {
                    // Successful capture! For dev/demo purposes:
                    console.log(
                        "Capture result",
                        orderData,
                        JSON.stringify(orderData, null, 2)
                    );
                    var transaction =
                        orderData.purchase_units[0].payments.captures[0];
                    alert(
                        "Transaction " +
                        transaction.status +
                        ": " +
                        transaction.id +
                        "\n\nSee console for all available details"
                    );
                    // When ready to go live, remove the alert and show a success message within this page. For example:
                    // var element = document.getElementById('paypal-button-container');
                    // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                    // Or go to another URL:  actions.redirect('thank_you.html');
                });
        },
    })
        .render("#paypal-button-container");
}