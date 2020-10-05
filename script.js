$(document).ready(function() {

    // defining global variables
    const queryURL = "https://api.openweathermap.org/data/2.5/"
    const key = "&appid=f04d2da5bb114685a28d60ef3008eba4"
    var todayDate = moment().format("l")
    var unitType = "&units=imperial"
    var cityName = ""
    var weatherIconEl = document.getElementById("weatherIcon")
    var weatherIconImg = document.createElement('img')
    var lat = ""
    var lon = ""

    // function for retrieving data for current weather and rendering it.
    function currentWeather() {

        // queryType defines the type of call we make to the API
        let queryType = "weather?q="  // calling today's weather data
        let dailyQueryURL = queryURL + queryType + cityName + unitType + key

        $.ajax({
            url: dailyQueryURL,
            method: "GET"
        }).then(function(res){
            console.log(res)
            searchedCity = res.name
            lat = res.coord.lat
            lon = res.coord.lon
            // console.log(res.weather[0].icon)
            $("#city-name").text(res.name + ": " + todayDate)
            weatherIconEl.appendChild(weatherIconImg)
            weatherIconImg.setAttribute("src", "https://openweathermap.org/img/w/" + res.weather[0].icon + ".png")
            weatherIconImg.setAttribute("alt", res.weather[0].description)
            $("#tempSpan").text(res.main.temp + "°F" + "  (feels like: " + res.main.feels_like + "°F)")
            $("#humSpan").text(res.main.humidity + "%")
            $("#windSpan").text(res.wind.speed + "mph")

            let weatherDescription = res.weather[0].description

            if (weatherDescription === "few clouds") {
                $(".pseudo").css("background-image", "url(images/sunny.jpg)")
            }
        }) 
    }

    // function for retrieving data for 5 day forecast and rendering it.
    function fiveDayForecast() {
        let queryType =  "onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" // calling 5 day forecast weather data
        let fiveDayQueryURL = queryURL + queryType + cityName + unitType + key

        $.ajax({
            url: fiveDayQueryURL,
            method: "GET"
        }).then(function(res){
            console.log(res)

            // convert the number string into a number value
            let uvValue = parseFloat(res.current.uvi)
            console.log(uvValue)

            $("#uvSpan").text(res.current.uvi)

            // set proper uv index color depending on the value
            if (uvValue < 3) {
                $("#uvSpan").css("background-color", "green")
                $("#uvText").text(" - Low")
            } else if (uvValue < 6) {
                $("#uvSpan").css("background-color", "yellow")
                $("#uvText").text(" - Moderate")
            } else if (uvValue < 8) {
                $("#uvSpan").css("background-color", "orange")
                $("#uvText").text(" - High")
            } else if (uvValue < 11) {
                $("#uvSpan").css("background-color", "red")
                $("#uvText").text(" - Very High")
            } else {
                $("#uvSpan").css("background-color", "violet")
                $("#uvText").text(" - Extreme")
            }

            $("#fiveDayDiv").empty()
            for (var i = 0; i < 5; i++) {

            // convert given unix time to a number value, then pass it through convertDate function to get date
            let dtToNum = parseFloat(res.daily[i].dt)
            let finalConvertedDate = convertDate(dtToNum)
            let avgTemp = (parseFloat(res.daily[i].temp.day) + parseFloat(res.daily[i].temp.night)) / 2
            console.log(finalConvertedDate)
            var newForeCard = 
                // can't be formatted to be cleaner??
                $("<div class='card foreCard'><div class='card-body'><h5 class='card-title'>" + finalConvertedDate + "</h5><img src='https://openweathermap.org/img/w/" + res.daily[i].weather[0].icon + ".png' alt='Weather Icon'><p>Temp: " + avgTemp.toFixed(2) + "°F</p><p>Humidity: " + res.daily[i].humidity + "%</p></div></div>")
            $("#fiveDayDiv").append(newForeCard)
            }
        })
    }

    // function to convert unix time to standard
    function convertDate(unixTime) {

        var date = new Date(unixTime*1000),
            yyyy = date.getFullYear(),
            mm = ('0' + (date.getMonth() + 1)).slice(-2),
            dd = ('0' + date.getDate()).slice(-2),

        convertedDate = mm + "/" + dd + "/" + yyyy
        return convertedDate
    }

    // adding click listener on search button
    $("#searchBtn").on("click", function(e){
        e.preventDefault();
        
        cityName = $("#searchInput").val().trim()
        $("#searchInput").val("")
        currentWeather()
        // workaround without having to use promises.  fiveDayForecast depends on data retreived from currentWeather.
        setTimeout(fiveDayForecast, 250)
    })
})