//Weather Dashboard - Beau Fortier

//global variables
var weatherResults = $(".search-results");
var searchBtn = $(".search-button");
var clearBtn = $(".clear-button");
var listGroup = $(".list-group");
var listContainer = $(".list-container")
var cityName = $(".search-bar").val();
var forecastContainer = $(".forcast-container");
var uvContainer = $(".uv-container")
var apiKey = "5769cc15ba5066b6f08d6542ae0e3f75"
var cities = JSON.parse(localStorage.getItem("cities")) || [];

//show search history on refresh
function init() {
    showSearch();
}
init();

//function to prevent duplicate searches from saving to local storage
function findCity(city) {
    for (var i = 0; i < cities.length; i++) {
        if (city === cities[i]){
            return true;
        }
    }
    return false;
}

//function to search for a city
function inputSearch(event) {
    event.preventDefault();

    var searchBar = $(".search-bar").val();

    if (!findCity(searchBar)){
    cities.push(searchBar)
    }

    //if the searchbar has a value, run this code
    if (searchBar) {
        //saves and shows search history/ fetches api data
        saveSearch();
        showSearch();
        getWeather(searchBar);
        //clears previous results
        weatherResults.empty();
        forecastContainer.empty();
        uvContainer.empty();
        searchBar.value = "";
    }

    //if the searchbar has no value, pop up modal.
    if (!searchBar) {
        $('#myModal').modal("show");
        $(".modal-body").text("Please enter a city name!")
    }
}

//function to pull info from api's
function getWeather(cityName) {

    var requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial" + "&appid=" + apiKey;
    var secondUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial" + "&appid=" + apiKey;
    
    //current weather
    fetch(requestUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    displayResults(data);
                    console.log(data)

                var lat = data.coord.lat
                var lon = data.coord.lon

                var uvUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey

                //uv index
                fetch(uvUrl)
                    .then(function (response) {
                        
                        if (response.ok) {
                            response.json().then(function (index) {
                                displayUV(index);
                                console.log(index);
                            })
                        }
                    })
                })
            }
        })

    // five day forecast
    fetch(secondUrl)
        .then(function (response) {
            
            if (response.ok) {
                response.json().then(function (results) {
                    displayForecast(results);
                    console.log(results)
                })
            }
        })
}

//function to display fetched data for current weather
function displayResults(data) {

    //creating containers for results
    var listResults = document.createElement("div");
    var resultBody = document.createElement("div");
    var titleImgCon = document.createElement("div")
    titleImgCon.setAttribute("class", "title-img-container")

    listResults.append(resultBody);
    
    var bodyTitle = document.createElement("h1");
    var bodyImg = document.createElement("img");
    var bodyInfo = document.createElement("p");
    var bodyInfo2 = document.createElement("p");
    var bodyInfo3 = document.createElement("p");

    bodyTitle.setAttribute("class", "body-title");
    bodyImg.setAttribute("class", "body-img")
    bodyInfo.setAttribute("class", "body-info");
    bodyInfo2.setAttribute("class", "body-info");
    bodyInfo3.setAttribute("class", "body-info");

    titleImgCon.append(bodyTitle, bodyImg);
    resultBody.append(titleImgCon, bodyInfo, bodyInfo2, bodyInfo3)

    var icon = data.weather[0].icon
    //math to calculate current date
    var date = new Date((data.dt)*1000).toLocaleDateString();

    //traversing through objects to display correct data
    bodyTitle.textContent = data.name + " (" + date + ")"
    bodyImg.src = 'https://openweathermap.org/img/wn/' + icon + "@2x.png";
    bodyInfo.textContent = "Temp: " + data.main.temp + " °F"
    bodyInfo2.textContent = "Wind Speed: " + data.wind.speed + " MPH"
    bodyInfo3.textContent = "Humidity: " + data.main.humidity + "%";

    weatherResults.append(listResults);
    weatherResults.append(uvContainer);
    weatherResults.append(forecastContainer);
    
}

//function to display fetch data for 5-day forecast
function displayForecast(results) {

    for (var i = 0; i < 5; i++) {

    var forecastCard = document.createElement("div")
    forecastCard.setAttribute("class", "forcast-card")
   
    var cardTitle = document.createElement("h4")
    var cardInfo = document.createElement("img")
    var cardInfo2 = document.createElement("p")
    var cardInfo3 = document.createElement("p")

    forecastCard.append(cardTitle, cardInfo, cardInfo2, cardInfo3);

    //math to display correct date and icon 
    var icon = results.list[((i+1)*8)-1].weather[0].icon
    var date = new Date((results.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();  

    //traversing objects to display correct data
    cardTitle.textContent = date;
    cardInfo.src = 'https://openweathermap.org/img/wn/' + icon + "@2x.png";
    cardInfo2.textContent = "Temp: " + results.list[((i+1)*8)-1].main.temp + " °F";
    cardInfo3.textContent = "Humidity: " + results.list[((i+1)*8)-1].main.humidity + " %"

    forecastContainer.append(forecastCard)
    }
}

//function to display fetch data for UVIndex
function displayUV(index) {
    var uvInfo = document.createElement("p");
    uvInfo.textContent = "UV Index: " + index.current.uvi;
    uvInfo.setAttribute("class", "body-info")

    //conditionals to set color to uv data
    if (index.current.uvi < 3) {
        uvInfo.setAttribute("class", "lowUV")
    }
    if (index.current.uvi < 6 && index.current.uvi >= 3) {
        uvInfo.setAttribute("class", "moderateUV")
    }
    if (index.current.uvi < 8 && index.current.uvi >= 6) {
        uvInfo.setAttribute("class", "highUV")
    }
    if (index.current.uvi < 11 && index.current.uvi >= 8) {
        uvInfo.setAttribute("class", "veryhighUV")
    }
    if (index.current.uvi >= 11) {
        uvInfo.setAttribute("class", "extremeUV")
    }

    uvContainer.append(uvInfo);
}

function saveSearch() {
    // save to local storage
    localStorage.setItem("cities", JSON.stringify(cities));
    
}

function showSearch() {

    //empty duplicates from search history
    $(".list-group").empty();
   
    //get from local storage
    JSON.parse(localStorage.getItem("cities"));

    //for each search create a list group item in search history
    cities.forEach(function (city){
        var listCity = document.createElement("li")
        
        listCity.setAttribute("class", "list-group-item");
        listCity.value = city;
        listCity.textContent = city;
        //searches city from search history on click
        listCity.addEventListener("click", searchCity)
       
        listGroup.append(listCity);
        

    })
}

//create clear button under group list
var clearButton = document.createElement("button");
    clearButton.textContent = "Clear History";
    clearButton.setAttribute("class", "clear-button")
    listContainer.append(clearButton);


//function to clear search history and refresh
function clearSearch() {
    localStorage.clear();
    location.reload(true);
};

//function to search city from search history
function searchCity(){
    console.log(this.textContent)
    weatherResults.empty();
    forecastContainer.empty();
    uvContainer.empty();
    showSearch();
    getWeather(this.textContent);
        
}

//clear history on click
$(".clear-button").click(clearSearch);
//search for city weather on click
$(".search-button").click(inputSearch);