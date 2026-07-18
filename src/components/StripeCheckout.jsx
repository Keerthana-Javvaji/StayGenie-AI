import { useState } from "react";
import axios from "axios";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function StripeCheckout({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      // Create PaymentIntent
      const { data } = await axios.post(
        "https://staygenie-backend.onrender.com/api/payment/create-payment-intent",
        {
          amount: Math.round(amount * 100),
        }
      );

      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
  setError(result.error.message);
} else if (result.paymentIntent.status === "succeeded") {

  onSuccess(result.paymentIntent.id);

}
    } catch (err) {
      setError("Payment failed.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#32325d",
            },
          },
        }}
      />

      {error && (
        <p className="text-red-500 text-sm mt-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!stripe || loading}
        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold"
      >
        {loading
          ? "Processing..."
          : `Pay ₹${amount}`}
      </button>
    </div>
  );
}