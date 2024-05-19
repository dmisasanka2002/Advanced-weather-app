const apiKey = "439300b944d80586999490fec6791720";
const baseUrl = "https://api.openweathermap.org/data/2.5/";
const iconURL = "https://openweathermap.org/img/wn/";

const dateTimeDiv = document.getElementById("date-time");
function updateTime() {
  const dateTime = new Date();
  const list = dateTime.toString().split(" ");
  dateTimeDiv.innerHTML = `<h2>${list[4]}</h2>
  <p>${list[0]}, ${list[1]} ${list[2]} ${list[3]}</p>`;
}

window.setInterval(updateTime, 1000);

document.getElementById("searchbar").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = document.getElementById("searchbar").value;
    if (city) {
      fetchWeatherData(city);
    }
  }
});

const seemorebtn = document.querySelectorAll(".content .header input");
seemorebtn.forEach((element) => {
  element.addEventListener("click", () => {
    window.location.href = "pages/moreinfo.html";
  });
});

async function fetchWeatherData(city) {
  const currentWeather = await getCurrentWeather(city);
  const { lat, lon } = currentWeather.coord;
  displayCurrentWeather(currentWeather);

  const foreCast = await getForeCast(city);
  displayForeCast(foreCast);

  displayTodayAir(currentWeather);

  const airPollution = await getAirPollution(lat, lon);
  displayAirPollution(airPollution);
}

async function getCurrentWeather(cityName) {
  const response = await fetch(
    `${baseUrl}weather?q=${cityName}&appid=${apiKey}&units=metric`
  );

  if (response.ok) {
    return response.json();
  }
}

async function getForeCast(cityName) {
  const response = await fetch(
    `${baseUrl}forecast?q=${cityName}&appid=${apiKey}&units=metric`
  );

  if (response.ok) {
    return response.json();
  }
}

async function getAirPollution(lat, lon) {
  const response = await fetch(
    `${baseUrl}air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );

  if (response.ok) {
    return response.json();
  }
}

function displayCurrentWeather(currentWeather) {
  const weather = currentWeather.weather;
  const temp = currentWeather.main.temp;

  const basicDetails = document.getElementById("basic-details");
  const mainImage = document.getElementById("main-image");

  basicDetails.innerHTML = `
    <h2>${currentWeather.name}</h2>
    <h3>${weather[0].main}</h3>
    <p>${weather[0].description}</p>
    <h1>${temp} °C</h1>`;

  mainImage.innerHTML = `<img src="images/${weather[0].main}.png" alt="" />`;
}

function displayForeCast(foreCast) {
  const todayForecastDiv = document.getElementById("today-forecast");
  const forecastDiv = document.getElementById("forecast");

  const foreCastList = foreCast.list;
  const todayForecastList = getTodayForeCast(foreCastList);
  todayForecastList.forEach((element) => {
    todayForecastDiv.innerHTML += `
      <div class="item">
        <p>${element.dt_txt.split(" ")[1]}</p>
        <img src="${iconURL}${element.weather[0].icon}@2x.png" alt="" />
        <h3>${element.main.temp}°C</h3>
      </div>
    `;
  });
}

async function displayTodayAir(currentWeather) {
  const airdiv = document.getElementById("air");

  console.log(currentWeather.main);
  const tempFeel = currentWeather.main.feels_like;
  const humidity = currentWeather.main.humidity;
  const wind = currentWeather.wind;

  airdiv.innerHTML = `
              <div class="content">
                <div class="item">
                  <div class="item">
                    <p>Real Feel</p>
                    <h3>${tempFeel} °C</h3>
                  </div>
                  <div class="item">
                    <p>Humidity</p>
                    <h3>${humidity} %</h3>
                  </div>
                </div>
                <div class="item">
                  <div class="item">
                    <p>Wind</p>
                    <h3>${wind.speed} m/s</h3>
                  </div>
                  <div class="item">
                    <p>UV Index</p>
                    <h3>5</h3>
                  </div>
                </div>
              </div>`;
}

function displayAirPollution(airPollution) {
  console.log(airPollution);
}

function getTodayForeCast(list) {
  let today = new Array();
  let nextDays;
  list.forEach((element) => {
    if (list[0].dt_txt.split(" ")[0] == element.dt_txt.split(" ")[0]) {
      today.push(element);
    } else {
    }
  });
  return today;
}
