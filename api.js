
const apikey = "382800a4ef1b37b545d66ad711387c7b";

// Function to fetch weather data from OpenWeather API
async function checkWeather() {
    const city = document.getElementById("cityInput").value; // Get city name from input
    const apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

    try {
        const response = await fetch(apiurl);
        
        // Check if response is ok, if not, throw an error
        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        const tempInCelsius = data.main.temp - 273.15; // Convert Kelvin to Celsius
        const condition = data.weather[0].description;
        // Display data in the HTML
        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temperature").innerText = tempInCelsius.toFixed(2);
        document.getElementById("climate").innerText =condition;
    } catch (error) {
        alert(error.message); // Show error if city not found
    }

    fetchHistory();
}

// Function to fetch city history from Wikipedia API
async function fetchHistory() {
    const city = document.getElementById('cityInput').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Fetching history...';

    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(city)}&prop=extracts&exintro=true&explaintext=true`);
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];

        if (page.missing) {
            resultDiv.innerHTML = 'No history found for this location.';
        } else {
            resultDiv.innerHTML = `<h3>${page.title}</h3><p>${page.extract}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = 'Error fetching history. Please try again later.';
        console.error(error);
    }
}