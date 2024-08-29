let globalForecastData; // Global variable to store forecast data

document.getElementById('weather-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    getWeather(city);
});

async function getWeather(city) {
    const apiKey = 'd54bd7e7b3ab46ee92b42054240208'; // Replace with your actual API key
    const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7`;
    const alertsUrl = `https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=${city}`;

    try {
        const [currentWeatherResponse, forecastResponse, alertsResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl),
            fetch(alertsUrl)
        ]);

        if (!currentWeatherResponse.ok || !forecastResponse.ok || !alertsResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        globalForecastData = await forecastResponse.json(); // Store data in global variable
        const alertsData = await alertsResponse.json();

        displayCurrentWeather(currentWeatherData);
        display7DayForecast(globalForecastData);
        displayHourlyForecast(globalForecastData);
        displayWeatherAlerts(alertsData);

    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('weather-result').innerHTML = `<p>Unable to fetch data. Please try again later.</p>`;
    }
}

function displayCurrentWeather(data) {
    const icon = getWeatherImage(data.current.condition.text);
    const currentWeatherHTML = `
        <div class="current-weather-container">
            <h2>Current Weather in ${data.location.name}, ${data.location.country}</h2>
            <img src="${icon}" alt="Weather Icon" class="weather-icon current-weather-icon">
            <p>Condition: ${data.current.condition.text}</p>
            <p>Temperature: ${data.current.temp_c} °C</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <p>Wind Speed: ${data.current.wind_kph} kph</p>
            <p>Wind Direction: ${data.current.wind_dir}</p>
        </div>
    `;
    document.getElementById('current-weather').innerHTML = currentWeatherHTML;
}

function display7DayForecast(data) {
    let forecastHTML = `<h2>7-Day Forecast</h2>`;
    const forecastData = data.forecast.forecastday; // Access the forecast data

    forecastData.forEach((day, index) => {
        const icon = getWeatherImage(day.day.condition.text);
        forecastHTML += `
            <button class="forecast-button" data-day="${index}" onclick="showGraph(${index})">
                <img src="${icon}" alt="Weather Icon" class="weather-icon">
                <p>${day.date}</p>
            </button>
        `;
    });

    document.getElementById('7-day-forecast').innerHTML = forecastHTML;
}

function displayHourlyForecast(data) {
    let hourlyHTML = `<h2>Hourly Forecast</h2>`;
    data.forecast.forecastday[0].hour.forEach(hour => {
        const icon = getWeatherImage(hour.condition.text);
        hourlyHTML += `
            <div>
                <p>${hour.time}</p>
                <img src="${icon}" alt="Weather Icon" class="weather-icon">
                <p>Condition: ${hour.condition.text}</p>
                <p>Temp: ${hour.temp_c} °C</p>
                <p>Wind Speed: ${hour.wind_kph} kph</p>
            </div>
        `;
    });
    document.getElementById('hourly-forecast').innerHTML = hourlyHTML;
}

function displayWeatherAlerts(data) {
    if (data.alerts && data.alerts.alert.length > 0) {
        let alertsHTML = `<h2>Weather Alerts</h2>`;
        data.alerts.alert.forEach(alert => {
            alertsHTML += `
                <div>
                    <p><strong>${alert.headline}</strong></p>
                    <p>${alert.desc}</p>
                    <p>Effective: ${alert.effective}</p>
                    <p>Expires: ${alert.expires}</p>
                </div>
            `;
        });
        document.getElementById('weather-alerts').innerHTML = alertsHTML;
    } else {
        document.getElementById('weather-alerts').innerHTML = '<p>No weather alerts.</p>';
    }
}

function getWeatherImage(condition) {
    if (condition.includes('Sunny') || condition.includes('Clear') || condition.includes('Mostly Sunny')) {
        return 'images/sunny.png';
    }
    if (condition.includes('Partly Cloudy') || condition.includes('Mostly Cloudy') || condition.includes('Partly Sunny')) {
        return 'images/partly_cloudy.png';
    }
    if (condition.includes('Cloudy') || condition.includes('Overcast')) {
        return 'images/cloudy.png';
    }
    if (condition.includes('Rain') || condition.includes('rain') || condition.includes('Showers') || condition.includes('Drizzle')) {
        return 'images/rain.png';
    }
    if (condition.includes('Thunderstorm') || condition.includes('Severe Thunderstorm') || condition.includes('Isolated Thunderstorms')) {
        return 'images/thunderstorm.png';
    }
    if (condition.includes('Clear Night') || condition.includes('Mostly Clear Night') || condition.includes('Mostly Clear Day')) {
        return 'images/night_clear.png';
    }
    if (condition.includes('Snow') || condition.includes('Snow Showers') || condition.includes('Flurries')) {
        return 'images/snow.png';
    }
    if (condition.includes('Mist') || condition.includes('Fog') || condition.includes('Haze') || condition.includes('Smoke') || condition.includes('Dust')) {
        return 'images/mist.png';
    }
    return 'images/default.png'; // Default image if no condition matches
}

// Function to show graph based on day button clicked
function showGraph(dayIndex) {
    const day = globalForecastData.forecast.forecastday[dayIndex];
    const graphContainer = document.getElementById('graph-container');

    // Clear existing graph
    graphContainer.innerHTML = '';

    // Create a canvas element for the graph
    const ctx = document.createElement('canvas');
    ctx.id = `graph-day-${dayIndex}`;
    graphContainer.appendChild(ctx);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: day.hour.map(hour => hour.time.split(' ')[1]), // Extract time (HH:MM)
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: day.hour.map(hour => hour.temp_c),
                    backgroundColor: 'rgba(255, 105, 180, 0.2)',
                    borderColor: 'rgba(255, 105, 180, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Wind Speed (kph)',
                    data: day.hour.map(hour => hour.wind_kph),
                    backgroundColor: 'rgba(135, 206, 250, 0.2)',
                    borderColor: 'rgba(135, 206, 250, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'time', // Use time scale for x-axis
                    time: {
                        unit: 'hour', // Show time in hours
                        tooltipFormat: 'HH:mm' // Format tooltip to show hour and minutes
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}
