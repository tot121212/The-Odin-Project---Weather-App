import "./css-reset.css";
import "./template.css";

import searchIcon from "./media/search.svg";
import temperatureIcon from "./media/thermometer-half.svg";

import {apiKey} from "./apiKey.js";

const createObjectFromSVG = (svg)=>{
    const object = document.createElement("object");
    object.setAttribute("type", "image/svg+xml");
    object.setAttribute("data", svg);
    return object;
}

const addObjectToElement = (element, object)=>{
    element.textContent = "";
    element.innerHTML = "";
    element.appendChild(object);
}

const degreeSymbol = "°";
let unitGroup = "us";
const getWeatherData = async (location) => {
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${apiKey}&unitGroup=${unitGroup}`);
        if (!response.ok){
            throw new Error("Error fetching weather data");
        }
        const weatherData = await response.json();
        console.log("weatherData:",weatherData);
        return { 
            temp : weatherData.currentConditions.temp, 
            description : weatherData.description,
            feelslike : weatherData.currentConditions.feelslike
        };
    } catch (error) {
        console.log(error);
        return {
            temp : "N/A",
            description : "N/A",
            feelslike : "N/A"
        };
    }
}

const formTempString = (temp) => {
    return String(temp) + degreeSymbol + (unitGroup === "us" ? "F" : "C");
}

// add loading wheel
document.addEventListener("DOMContentLoaded", ()=>{
    const locationElement = document.querySelector("input#location");
    if (locationElement){
        let curTimeout;
        locationElement.addEventListener("change", ()=>{
            // update weather info based upon that location
            curTimeout && clearTimeout(curTimeout);
            if (!locationElement.value) {return};
            curTimeout = setTimeout(async ()=>{
                const {temp, description, feelslike} = await getWeatherData(locationElement.value);

                const stringTemp = formTempString(temp);
                console.log("stringTemp:", stringTemp);
                stringTemp & (document.querySelector(".current-temp").textContent = stringTemp);

                document.querySelector(".description").textContent = description;

                document.querySelector(".feels-like").textContent = "Feels like: " + formTempString(feelslike);
            }, 100);
        });
    }
    
    const toggleTempTypeButton = document.querySelector("button#toggle-temp-type");
    if (toggleTempTypeButton){
        addObjectToElement(toggleTempTypeButton, createObjectFromSVG(temperatureIcon));
        toggleTempTypeButton.addEventListener("click", async ()=>{
            switch (unitGroup){
                case "us":
                    unitGroup = "metric";
                    toggleTempTypeButton.classList.remove("fahrenheit");
                    toggleTempTypeButton.classList.add("celsius");
                    // search current query for celsius temp
                    break;
                case "metric":
                    unitGroup = "us";
                    toggleTempTypeButton.classList.remove("celsius");
                    toggleTempTypeButton.classList.add("fahrenheit");
                    // search current query for fahrenheit temp
                    break;
            }
            console.log("unitGroup:",unitGroup);

            locationElement.dispatchEvent(new Event("change"));

            toggleTempTypeButton.classList.add("fade");
            setTimeout(()=>{
                toggleTempTypeButton.classList.remove("fade");
            }, 300);
        });
    }

    // const searchButton = document.querySelector("button#search");
    // if (searchButton){
    //     addObjectToElement(searchButton, createObjectFromSVG(searchIcon));
    //     searchButton.addEventListener("click", ()=>{
    //         // search
    //     });
    // }
});