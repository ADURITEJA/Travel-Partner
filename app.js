const OPENWEATHER_API_KEY = "382800a4ef1b37b545d66ad711387c7b";
const GOOGLE_MAPS_API_KEY = "AIzaSyDRJfjNiVjWmidzsJSrA62p0S4Mlcb4yH0";
const KNOWLEDGE_GRAPH_API_KEY = "AIzaSyDRJfjNiVjWmidzsJSrA62p0S4Mlcb4yH0"; // Replace with your actual API key

// Function to get weather data
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Function to fetch famous places
async function getFamousPlaces(lat, lon) {
  const url = `http://localhost:3000/api/places?lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching famous places:", error);
    return [];
  }
}

// Function to fetch fun facts about the city
async function getFunFacts(city) {
  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${city}&key=${KNOWLEDGE_GRAPH_API_KEY}&limit=1&languages=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const entity = data.itemListElement[0].result;

    let funFacts = [];
    if (entity && entity.description) {
      funFacts.push(entity.description);
    }

    if (entity && entity.detailedDescription) {
      funFacts.push(entity.detailedDescription.articleBody);
    }

    return funFacts.length > 0 ? funFacts : ["No fun facts available."];
  } catch (error) {
    console.error("Error fetching fun facts:", error);
    return ["Could not retrieve fun facts."];
  }
}

// Function to get travel suggestions
async function getTravelSuggestions(currentLocation, destination) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: destination,
  });

  directionsRenderer.setMap(map);

  const travelSuggestionsDiv = document.getElementById("travelSuggestions");

  const request = {
    origin: currentLocation,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      travelSuggestionsDiv.innerHTML = `
        <h3>Best route from your current location to the city:</h3>
        <p>Driving Distance: ${result.routes[0].legs[0].distance.text}</p>
        <p>Duration: ${result.routes[0].legs[0].duration.text}</p>
      `;
    } else {
      travelSuggestionsDiv.innerHTML = "<p>Sorry, we could not find a route.</p>";
    }
  });

  travelSuggestionsDiv.innerHTML += `
    <h4>Other travel options:</h4>
    <ul>
      <li>Bus: 2 hours</li>
      <li>Train: 1.5 hours</li>
      <li>Flight: 30 minutes</li>
      <li>Local transport: Available</li>
    </ul>
  `;
}

// Function to get user's current location
function getCurrentLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        callback(currentLocation);
      },
      (error) => {
        console.error("Geolocation error: ", error);
        alert("Could not retrieve your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Function to initialize the map and display markers
function initMap(lat, lon, places) {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng: lon },
    zoom: 14,
  });

  new google.maps.Marker({
    position: { lat, lng: lon },
    map: map,
    title: "City Center",
  });

  places.forEach((place) => {
    const marker = new google.maps.Marker({
      position: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
      map: map,
      title: place.name,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${place.name}</h3><p>${place.vicinity || "No address available"}</p>`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });

  displayPlacesList(places);
}

// Function to display the list of places
function displayPlacesList(places) {
  const placesListDiv = document.getElementById("placesList");
  const placesList = places
    .map(
      (place) => `
      <li><strong>${place.name}</strong>: ${place.vicinity || "No address available"}</li>
    `
    )
    .join("");

  placesListDiv.innerHTML = `
    <h3>Nearby Famous Places:</h3>
    <ul>${placesList}</ul>
  `;
}

// Function to display fun facts about the city
async function displayFunFacts(city) {
  const funFacts = await getFunFacts(city);
  const funFactsDiv = document.getElementById("funFacts");

  funFactsDiv.innerHTML = `
    <h3>Fun Facts about ${city}:</h3>
    <ul>
      ${funFacts.map(fact => `<li>${fact}</li>`).join('')}
    </ul>
  `;
}

// Main function to suggest destinations
async function suggestDestination(city) {
  const weatherData = await getWeather(city);

  if (weatherData && weatherData.main) {
    const { name, main, weather, coord } = weatherData;
    const temperature = main.temp;
    const condition = weather[0].description;

    document.getElementById("suggestion").innerHTML = `
      <h3>Destination: ${name}</h3>
      <p>Temperature: ${temperature}°C</p>
      <p>Condition: ${condition}</p>
    `;

    const places = await getFamousPlaces(coord.lat, coord.lon);
    initMap(coord.lat, coord.lon, places);

    displayFunFacts(name);

    getCurrentLocation((currentLocation) => {
      getTravelSuggestions(currentLocation, coord);
    });
  } else {
    document.getElementById("suggestion").innerHTML = `
      <p>Could not fetch weather data. Please try another city.</p>
    `;
  }
}

// Add event listener to search button
document.getElementById("searchButton").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;
  if (city) {
    suggestDestination(city);
  }
});