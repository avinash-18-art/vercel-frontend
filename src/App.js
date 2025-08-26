import axios from "axios";
import React, { useState } from "react";
import './App.css';

function App() {
  const [responseId, setResponseId] = useState("");
  const [responseState, setResponseState] = useState(null);
  const [orderAmount, setOrderAmount] = useState(100);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount) => {
    try {
      const response = await axios.post("http://localhost:5000/orders", {
        amount: amount * 100,
        currency: "INR"
      });

      return response.data;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return null;
    }
  };

  const handleRazorpayScreen = async () => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const order = await createRazorpayOrder(orderAmount);
    if (!order) {
      alert("Failed to create order. Try again.");
      return;
    }

    const options = {
      key: "rzp_test_9ViO0p7vRG2H3h",
      amount: order.amount,
      currency: order.currency,
      name: "Avinash Chauhan",
      description: "Payment to Avinash Chauhan",
      image: "https://papayacoders.com/demo.png",
      order_id: order.order_id,
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
      },
      prefill: {
        name: "Avinash Chauhan",
        email: "chauhanavinash36869@gmail.com"
      },
      theme: {
        color: "#032d99ff"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const paymentFetch = async (e) => {
    e.preventDefault();
    const paymentId = e.target.paymentId.value.trim();

    if (!paymentId) {
      alert("Please enter a payment ID.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/payment/${paymentId}`);
      setResponseState(response.data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      alert("Failed to fetch payment. Make sure the ID is correct.");
    }
  };

  return (
    <div className="app-container">
      <div className="payment-card">
        <h2 style={{ color: 'white' }}>Razorpay Payment</h2>

        <input
          className="input"
          type="number"
          value={orderAmount}
          onChange={(e) => setOrderAmount(e.target.value)}
          placeholder="Enter amount in Rs."
        />
        <button className="pay-button" onClick={handleRazorpayScreen}>
          Pay ₹{orderAmount}
        </button>

        {responseId && <p className="payment-id"><strong>Payment ID:</strong> {responseId}</p>}

        <hr className="divider" />

        <h3 style={{ color: 'white' }}>🔍 Verify Payment</h3>
        <form className="verify-form" onSubmit={paymentFetch}>
          <input className="input" type="text" name="paymentId" placeholder="Enter Payment ID" />
          <button className="verify-button" type="submit">Fetch Payment Details</button>
        </form>

        {responseState && (
          <ul className="payment-details">
            <li style={{ color: 'white' }}><strong>Amount:</strong> ₹{responseState.amount / 100}</li>
            <li style={{ color: 'white' }}><strong>Currency:</strong> {responseState.currency}</li>
            <li style={{ color: 'white' }}><strong>Status:</strong> {responseState.status}</li>
            <li style={{ color: 'white' }}><strong>Method:</strong> {responseState.method}</li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
