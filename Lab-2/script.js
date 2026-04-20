const input = document.getElementById("cityInput");
const button = document.getElementById("searchBtn");
const result = document.getElementById("weatherResult");
const historyList = document.getElementById("history");
const consoleBox = document.getElementById("consoleBox");


function log(message){
    console.log(message);
    consoleBox.innerHTML += message + "<br>";
}


/* EVENT LOOP DEMO */

log("Script Started");

setTimeout(()=>{
    log("Async task executed");
},0);

log("Script Finished");


button.addEventListener("click", ()=>{
    const city = input.value;

    if(city === ""){
        alert("Enter city name");
        return;
    }

    getWeather(city);
});


async function getWeather(city){

    try{

        log("Before fetch");

        const response = await fetch(`https://wttr.in/${city}?format=j1`);

        log("After fetch");

        const data = await response.json();

        const temp = data.current_condition[0].temp_C;
        const condition = data.current_condition[0].weatherDesc[0].value;

        result.innerHTML = `
        <b>City:</b> ${city}<br>
        <b>Temperature:</b> ${temp}°C<br>
        <b>Condition:</b> ${condition}
        `;

        saveCity(city);

    }

    catch(error){

        result.innerHTML = "Error fetching weather";

    }

}


/* LOCAL STORAGE */

function saveCity(city){

    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    if(!cities.includes(city)){
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));
    }

    showHistory();

}


function showHistory(){

    historyList.innerHTML="";

    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    cities.forEach(city=>{

        let li = document.createElement("li");
        li.textContent = city;

        li.addEventListener("click", ()=>{
            getWeather(city);
        });

        historyList.appendChild(li);

    });

}

showHistory();