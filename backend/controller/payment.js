const ErrorHandler = require("../utils/ErrorHandler");
const express = require("express");
const catchAsyncError = require("../middleware/catchAsyncError");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post( 
  "/process",
  catchAsyncError(async (req, resp, next) => {
    console.log("Creating PaymentIntent with amount:", req.body.amount);

    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "usd",
      metadata: {
        company: "Saif Ventures",
      },
    });
    console.log("PaymentIntent created:", myPayment.id);
    
    resp.status(201).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

router.get(
  "/stripeapikey",
  catchAsyncError(async (req, resp, next) => {
    resp.status(200).json({
      stripeApiKey: process.env.STRIPE_API_KEY,
    });
  })
);


module.exports = router