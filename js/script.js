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
  var { todayForecastList, nextDaysForecastList } =
    getTodayForeCast(foreCastList);
  todayForecastList.forEach((element) => {
    todayForecastDiv.innerHTML += `
      <div class="item">
        <p>${element.dt_txt.split(" ")[1]}</p>
        <img src="${iconURL}${element.weather[0].icon}@2x.png" alt="" />
        <h3>${element.main.temp}°C</h3>
      </div>
    `;
  });

  const { avgTemp, avgHumidity, avgWeatherID } =
    getDayAvarage(todayForecastList);
  const { wetherIcon, description } = getWeatherCoditionID(avgWeatherID);
  forecastDiv.innerHTML += `
                <div class="item">
                  <p>Today</p>
                  <div>
                    <img src="${iconURL}${wetherIcon}@2x.png" alt="" />
                    <h4>sunny</h4>
                  </div>
                  <h3>${avgTemp}°C</h3>
                </div>`;

  while (nextDaysForecastList) {
    var { todayForecastList, nextDaysForecastList } =
      getTodayForeCast(nextDaysForecastList);
    const { avgTemp, avgHumidity, avgWeatherID } =
      getDayAvarage(todayForecastList);
    const { wetherIcon, description } = getWeatherCoditionID(avgWeatherID);
    forecastDiv.innerHTML += `
                <div class="item">
                  <p>Today</p>
                  <div>
                  <img src="${iconURL}${wetherIcon}@2x.png" alt="" />
                    <h4>sunny</h4>
                  </div>
                  <h3>${avgTemp}°C</h3>
                </div>`;
  }
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
  let nextDays = new Array();

  list.forEach((element) => {
    if (list[0].dt_txt.split(" ")[0] == element.dt_txt.split(" ")[0]) {
      today.push(element);
    } else {
      nextDays.push(element);
    }
  });
  return { today, nextDays };
}

function getDayAvarage(list) {
  let temp = 0;
  let humidity = 0;
  let weatherID = 0;
  const size = list.length;

  for (const item of list) {
    temp += item.main.feels_like;
    humidity += item.main.humidity;
    weatherID += item.weather[0].id;
  }

  const avgTemp = temp / size;
  const avgHumidity = humidity / size;
  const avgWeatherID = weatherID / size;

  return { avgTemp, avgHumidity, avgWeatherID };
}

function getWeatherCoditionID(id) {
  fetch("../jsonweather_conditions.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.id) {
        const wetherIcon = data.id.icon;
        const description = data.id.description;
        return { wetherIcon, description };
      } else {
        const id = getNearstId(id);
        const wetherIcon = data.id.icon;
        const description = data.id.description;
        return { wetherIcon, description };
      }
    });
}

function getNearstId(ID) {
  let minid = ID;
  let maxid = ID;
  fetch("../jsonweather_conditions.json")
    .then((response) => response.json())
    .then((data) => {
      while (!data.minid) {
        minid--;
      }
      const min = minid;
      while (!data.maxid) {
        maxid++;
      }
      const max = maxid;

      if (ID - min > max - ID) {
        return max;
      } else {
        return min;
      }
    });
}
