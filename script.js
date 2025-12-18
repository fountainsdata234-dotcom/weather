const API_KEY = "eaec9e938ffe4998805123651251612";
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";

const loader = document.getElementById("loader");
const dash = document.getElementById("dash");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// --- Start Up ---
window.addEventListener("load", () => {
  const savedCity = localStorage.getItem("nexus_last_city");
  if (savedCity) {
    fetchWeather(savedCity);
  } else {
    // Geo Check
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
        () => fetchWeather("Lagos") // Fallback if user denies geo
      );
    } else {
      fetchWeather("Lagos");
    }
  }
});

// --- Search Events ---
searchBtn.addEventListener("click", () => {
  if (searchInput.value.trim()) fetchWeather(searchInput.value.trim());
});
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchInput.value.trim())
    fetchWeather(searchInput.value.trim());
});

// --- Logic ---
async function fetchWeather(query) {
  // Show Loader
  loader.style.opacity = "1";
  loader.style.display = "flex";
  dash.style.opacity = "0";

  try {
    // Ensure HTTPS
    const res = await fetch(
      `${BASE_URL}?key=${API_KEY}&q=${query}&days=5&aqi=no&alerts=no`
    );
    if (!res.ok) throw new Error("Sector Scan Failed");

    const data = await res.json();

    // Save successful search
    localStorage.setItem("nexus_last_city", data.location.name);

    // Render
    updateDisplay(data);

    // Hide Loader
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
        dash.style.opacity = "1";
      }, 500);
    }, 500);
  } catch (err) {
    console.error(err);
    alert("NAVIGATION ERROR: Unable to find location. Try another city.");
    loader.style.opacity = "0";
    setTimeout(() => (loader.style.display = "none"), 500);
  }
}

function updateDisplay(data) {
  const cur = data.current;
  const loc = data.location;
  const days = data.forecast.forecastday;

  // Header Info
  document.getElementById("city").textContent = loc.name; // Keep it simple to prevent overflow
  document.getElementById("time").textContent = loc.localtime;
  document.getElementById(
    "coords"
  ).textContent = `LAT: ${loc.lat} | LON: ${loc.lon}`;

  document.getElementById("temp").textContent = Math.round(cur.temp_c);
  document.getElementById("condition").textContent = cur.condition.text;

  // Fix icon
  let icon = cur.condition.icon;
  if (!icon.startsWith("https:")) icon = "https:" + icon;
  document.getElementById("icon").src = icon;

  // Stats
  document.getElementById("wind").textContent = `${cur.wind_kph} km/h`;
  document.getElementById("humidity").textContent = `${cur.humidity}%`;
  document.getElementById("pressure").textContent = `${cur.pressure_mb} mb`;
  document.getElementById("visibility").textContent = `${cur.vis_km} km`;
  document.getElementById("uv").textContent = cur.uv;

  // Forecast
  const list = document.getElementById("forecastList");
  list.innerHTML = "";

  days.forEach((d) => {
    const date = new Date(d.date);
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    let fIcon = d.day.condition.icon;
    if (!fIcon.startsWith("https:")) fIcon = "https:" + fIcon;

    list.innerHTML += `
                    <div class="forecast-row">
                        <div class="f-day">${dayName}</div>
                        <img src="${fIcon}" class="f-icon">
                        <div class="f-temps">${Math.round(
                          d.day.maxtemp_c
                        )}° / ${Math.round(d.day.mintemp_c)}°</div>
                        <div class="f-rain"><i class="fa-solid fa-cloud-rain"></i> ${
                          d.day.daily_chance_of_rain
                        }%</div>
                    </div>
                `;
  });
}
