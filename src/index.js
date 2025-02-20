// look at weather data and see what kind of elements we need to display...

document.addEventListener("DOMContentLoaded", ()=>{
    const locationElement = document.querySelector("location");
    locationElement.addEventListener("change", ()=>{
        // update weather info based upon that location
    });
    let curTempType = "F";
    const toggleTempTypeButton = document.querySelector("toggle-temp-type");
    toggleTempTypeButton.addEventListener("click", ()=>{
        // update temp type displayed to either toggle
        switch (curTempType){
            case "F":
                curTempType = "C";
            case "C":
                curTempType = "F";
        }
    });
});