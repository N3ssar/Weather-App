const city = document.querySelector(".city-search");
const searchButton = document.querySelector(".search-button");
const apiKey = "55db5114c971f30073a445d677e6a56b";
const weatherInfoSection = document.querySelector(".weather-info");
const messageImage = document.querySelector(".message-image");
const messageText = document.querySelector(".message-content");
const countryName = document.querySelector(".country-text");
const temperature = document.querySelector(".weather-temp");
const conditionText = document.querySelector(".condition-text");
const humidity = document.querySelector(".humidity-value");
const windSpeed = document.querySelector(".wind-value");
const currentDate = document.querySelector(".current-date");

// Add event listener for button click
searchButton.addEventListener("click", handleSearch);

// Add event listener for Enter key
city.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSearch(e);
  }
});

// Unified search handler function
function handleSearch(e) {
  const searchTerm = city.value.trim();
  if (searchTerm !== "") {
    updateWeatherInfo(searchTerm);
    city.blur();
  }
}

// Format the current date nicely
function formatCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  };
  return now.toLocaleDateString("en-US", options).toLowerCase();
}

// Get weather icon based on OpenWeather condition code
function getWeatherIcon(weatherId) {
  if (weatherId >= 200 && weatherId < 300) {
    return "assets/weather/thunderstorm.svg";
  } else if (weatherId >= 300 && weatherId < 400) {
    return "assets/weather/drizzle.svg";
  } else if (weatherId >= 500 && weatherId < 600) {
    return "assets/weather/rain.svg";
  } else if (weatherId >= 600 && weatherId < 700) {
    return "assets/weather/snow.svg";
  } else if (weatherId >= 700 && weatherId < 800) {
    return "assets/weather/atmosphere.svg";
  } else if (weatherId === 800) {
    return "assets/weather/clear.svg";
  } else {
    return "assets/weather/clouds.svg";
  }
}

// Get current weather data
async function getWeatherData(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(apiUrl);
    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data", error);
    return { cod: "error" };
  }
}

// Get 5-day forecast data
async function getForecastData(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(apiUrl);
    const forecastData = await response.json();
    return forecastData;
  } catch (error) {
    console.error("Error fetching forecast data", error);
    return { cod: "error" };
  }
}

// Update forecast section with data
function updateForecast(forecastData) {
  const forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = ""; // Clear existing forecast items

  // Get one forecast per day (data comes in 3-hour intervals)
  const dailyForecasts = {};

  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split("T")[0];

    // Only take the first forecast for each day
    if (!dailyForecasts[dateKey]) {
      dailyForecasts[dateKey] = item;
    }
  });

  // Create forecast items (limit to 5 days)
  Object.values(dailyForecasts)
    .slice(0, 5)
    .forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const formattedDate = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short"
      });
      const weatherId = forecast.weather[0].id;
      const temp = Math.round(forecast.main.temp);

      const forecastItem = document.createElement("div");
      forecastItem.className =
        "forecast-item min-w-20 flex-col p-2.5 gap-2 items-center rounded-2xl";
      forecastItem.innerHTML = `
      <h4 class="forecast-item-date regular-text">${formattedDate}</h4>
      <img src="${getWeatherIcon(
        weatherId
      )}" class="w-12 h-12" alt="Weather image">
      <h5 class="forecast-item-temperature">${temp} °C</h5>
    `;

      forecastContainer.appendChild(forecastItem);
    });
}

// Toggle UI sections
function toggleSections(show) {
  const weatherInfoSection = document.querySelector(".weather-info");
  const searchCitySection = document.querySelector(".search-city");

  if (show) {
    weatherInfoSection.classList.remove("hidden");
    searchCitySection.classList.add("hidden");
  } else {
    weatherInfoSection.classList.add("hidden");
    searchCitySection.classList.remove("hidden");
  }
}

// Update weather information
async function updateWeatherInfo(cityName) {
  try {
    const weatherData = await getWeatherData(cityName);

    if (weatherData.cod !== 200) {
      messageImage.src = "assets/message/not-found.png";
      messageImage.alt = "City not found";
      document.querySelector(".search-message-title").textContent =
        "City not found";
      document.querySelector(".search-message-paragraph").textContent =
        "Please try another city.";
      toggleSections(false);
      return;
    }

    // Update current weather
    const weatherImage = document.querySelector(".weather-image");
    const {
      main: { temp, humidity: humidityValue },
      weather: [{ id: weatherId, main }],
      wind: { speed },
      name: country
    } = weatherData;

    countryName.textContent = country;
    temperature.textContent = `${Math.round(temp)} °C`;
    conditionText.textContent = main;
    document.querySelector(".humidity-value").textContent = `${humidityValue}%`;
    document.querySelector(".wind-value").textContent = `${speed} m/s`;
    currentDate.textContent = formatCurrentDate();
    weatherImage.src = getWeatherIcon(weatherId);

    // Get and update forecast
    const forecastData = await getForecastData(cityName);
    if (forecastData.cod === "200") {
      updateForecast(forecastData);
    }

    // Show weather info, hide search message
    toggleSections(true);
  } catch (error) {
    console.error("Error updating weather information", error);
    document.querySelector(".search-message-title").textContent = "Error";
    document.querySelector(".search-message-paragraph").textContent =
      "Something went wrong. Please try again.";
    toggleSections(false);
  }
}

// Add initial state setup
function initApp() {
  toggleSections(false);
}

// Initialize the app
initApp();
