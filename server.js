const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
require('dotenv').config();

const app = express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(cors({origin: true, credentials: true}));

const stripe = require("stripe")("sk_test_51OqJ2dFqCl4i3LlWC4vZ1H5IoeGh16CXXXyNJIsFHCe5S4g5mEM0xvNxy0wbUGTp3FvwpZdFyMmOduRRJDWI5YrL00N4RAtCUr");
const port = process.env.PORT || 4242;
const successUrl = process.env.SUCCESS_URL || "http://localhost:4242/success.html";
const cancelUrl = process.env.CANCEL_URL || "http://localhost:4242/cancel.html";

app.get("/", (req, res) => {
    res.send("Welcome to store server!");
  });

app.post("/checkout", async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({

            // inicio envios gratis
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 0,
                        currency: 'usd',
                    },
                    display_name: 'Free shipping',
                    // Delivers between 5-7 business days
                    delivery_estimate: {
                        minimum: {
                        unit: 'business_day',
                        value: 5,
                        },
                        maximum: {
                        unit: 'business_day',
                        value: 7,
                        },
                    }
                    }
                },
                {
                    shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 1500,
                        currency: 'usd',
                    },
                    display_name: 'Next day air',
                    // Delivers in exactly 1 business day
                    delivery_estimate: {
                        minimum: {
                        unit: 'business_day',
                        value: 1,
                        },
                        maximum: {
                        unit: 'business_day',
                        value: 1,
                        },
                    }
                    }
                },
            ],
            // fin envios gratis

            line_items: req.body.items.map((item) => ({
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: item.name,
                    images: [item.product]
                  },
                  unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl
        });

        res.status(200).json(session);
        
    } catch (error) {
        next(error);
    }
});

app.listen(port, () => console.log('App corriendo en '+ port));