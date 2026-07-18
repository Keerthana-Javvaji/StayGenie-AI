import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  "pk_test_51TuTvXFz2yx2bjG7ZvmpaphFNfhD8806R9vRHpV4PiaOPki3tywccrLub1SwlB8W91mgmVVKNxqFoSdQxHf9u9KN003Zbi8xj8"
);