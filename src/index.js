import "./css-reset.css";
import "./template.css";

import temperatureIcon from "./media/thermometer-half.svg";
// import all svgs into one object for all weathers inside of media/4th-monochrome from visual crossing
const importWeatherIcons = require.context("./media/4th-monochrome", false, /\.svg$/);
const weatherIcons = {};
importWeatherIcons.keys().forEach((fileName) => {
    const iconName = fileName.replace('./', '').replace('.svg', ''); // Remove "./" and ".svg"
    weatherIcons[iconName] = importWeatherIcons(fileName); // Import the SVG
});


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
            throw new Error("Could not fetch weather data, invalid input?");
        }
        const weatherData = await response.json();
        console.log("weatherData:",weatherData);
        return {
            locationName : weatherData.resolvedAddress,
            temp : weatherData.currentConditions.temp,
            description : weatherData.description,
            feelslike : weatherData.currentConditions.feelslike,
            icon : weatherData.currentConditions.icon
        };
    } catch (error) {
        console.log(error);
        return {
            locationName : "No Location Found",
            temp : "",
            description : "",
            feelslike : "",
            icon : ""
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
        locationElement.addEventListener("input", ()=>{ 
            // update weather info based upon that location
            curTimeout && clearTimeout(curTimeout);
            if (!locationElement.value) {return};
            curTimeout = setTimeout(async ()=>{
                const {locationName, temp, description, feelslike, icon} = await getWeatherData(locationElement.value);

                const locationNameElement = document.querySelector(".location-name");
                locationNameElement.textContent = locationName;

                const stringTemp = formTempString(temp);
                console.log("stringTemp:", stringTemp);

                const currentTempElement = document.querySelector(".current-temp");
                stringTemp && (currentTempElement.textContent = stringTemp);

                const descriptionElement = document.querySelector(".description");
                descriptionElement.textContent = description;

                const feelsLikeElement = document.querySelector(".feels-like");
                feelsLikeElement.textContent = "Feels like: " + formTempString(feelslike);

                const iconPath = weatherIcons[icon];
                console.log("iconPath:",iconPath);

                const weatherIconElement = document.querySelector(".weather-icon");
                weatherIconElement.src = iconPath;
                weatherIconElement.alt = icon;

                if (locationName === "No Location Found"){
                    currentTempElement.hidden = true;
                    descriptionElement.hidden = true;
                    feelsLikeElement.hidden = true;
                    weatherIconElement.hidden = true;
                } else {
                    currentTempElement.hidden = false;
                    descriptionElement.hidden = false;
                    feelsLikeElement.hidden = false;
                    weatherIconElement.hidden = false;
                }
            }, 360);
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

            locationElement.dispatchEvent(new Event("input"));

            toggleTempTypeButton.classList.add("fade");
            setTimeout(()=>{
                toggleTempTypeButton.classList.remove("fade");
            }, 300);
        });
    }
});