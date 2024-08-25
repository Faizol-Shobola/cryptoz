// Get references to the HTML elements
const fromCurrency = document.getElementById("from_currency");
const toCurrency = document.getElementById("to_currency");
const amount = document.getElementById("amount");
const result = document.getElementById("result");
const dateField = document.getElementById("date_field");
const API_KEY = process.env.API_KEY;

// Set today's date in the date field
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  dateField.valueAsDate = today;

  // Check if exchange rates are already stored in local storage
  const exchangeRates = JSON.parse(localStorage.getItem("exchangeRates"));

  if (!exchangeRates) {
    // Fetch exchange rates from API if not stored in local storage
    fetchExchangeRates();
  } else {
    // Populate the select options with the stored exchange rates
    handleSelectPopulate(exchangeRates);
  }
});

/*****************
 * Fetch live exchange rates and populate select options
 *****************/

const fetchExchangeRates = (
  endpoint = "https://exchange-rates.abstractapi.com/v1/live"
) => {
  const date = dateField.value;
  // Set up the fetch request options
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Fetch exchange rates from API if not stored in local storage
  fetch(`${endpoint}/?api_key=${API_KEY}&base=USD&date=${date}`, options)
    .then((response) => response.json())
    .then((response) => {
      // Store the fetched exchange rates in local storage
      const exchangeRates = response.exchange_rates;
      localStorage.setItem("exchangeRates", JSON.stringify(exchangeRates));
      // Populate the select options with the exchange rates
      handleSelectPopulate(exchangeRates);
    })
    .catch((error) => console.log(error));
};

/*****************
 * Populate the select options with exchange rates
 *****************/
const handleSelectPopulate = (exchangeRates) => {
  // Loop through the exchange rates and populate the select options
  for (const currency in exchangeRates) {
    const option = document.createElement("option");
    option.value = currency;
    option.text = currency;
    fromCurrency.appendChild(option.cloneNode(true));
    toCurrency.appendChild(option.cloneNode(true));
  }
};

/*****************
 * Convert currency
 *****************/
const handleConversion = () => {
  const fromCurrencyValue = fromCurrency.value;
  const toCurrencyValue = toCurrency.value;
  const date = dateField.value;

  // Set up the fetch request options
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Fetch the conversion rate from API and calculate the result
  fetch(`
    https://exchange-rates.abstractapi.com/v1/convert/?api_key=${API_KEY}&base=${fromCurrencyValue}&target=${toCurrencyValue}&base_amount=${amount.value}&date=${date}`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      const convertedAmount = response.converted_amount;
      console.log(response, convertedAmount);
      result.value = convertedAmount;
    })
    .catch((error) => console.log(error));
};

const updateExchangeRates = () => {
  // Clear the stored exchange rates from local storage
  localStorage.removeItem("exchangeRates");
  // Fetch exchange rates from API
  fetchExchangeRates(
    (endpoint = "https://exchange-rates.abstractapi.com/v1/historical")
  );
  handleConversion();
};

// Add event listeners to trigger conversion when input or select values change
let typingTimeout;

amount.addEventListener("input", () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(handleConversion, 1000);
});
fromCurrency.addEventListener("change", handleConversion);
toCurrency.addEventListener("change", handleConversion);
dateField.addEventListener("change", updateExchangeRates);