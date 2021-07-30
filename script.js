import abbreviation from './stateAbbreviations.js';

const ipAddressNode = document.getElementById('ip-address')
const ipLocationNode = document.getElementById('ip-location')
const ipTimeZoneNode = document.getElementById('ip-timezone')
const ipISPNode = document.getElementById('ip-isp')
const ipInputNode = document.getElementById('ipInput')
const ipInfoBlockNode = document.getElementsByClassName('ip-info-block')
const loaderNode = document.getElementsByClassName('loader')[0]
const errorDisplayNode = document.getElementsByClassName('error-display')[0]
const form = document.getElementById("form")

//holds the map
let mymap = L.map('mapid', 
    {
        zoomControl: false,
    }
)

//sets up the icon of the map
let myIcon = L.icon({
    iconUrl: 'images/icon-location.svg',
    iconSize: [38, 45],
    iconAnchor: [22, 45],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});

//query an ip if it clicked
form.addEventListener('submit', function(e){
    e.preventDefault()
    const apiAddress = ipInputNode.value

    //hide IP info container
    hideIPInfoBlock()

    //turn loader on
    loaderNode.classList.toggle('loader')
    errorDisplayNode.innerText = ""

    //get ip address and display it otherwise handle error
    getIPAddress(apiAddress)
        .then(jsonResponse => {
            updateDOM(jsonResponse)
        })
        .catch( error => {
            //hide loader
            loaderNode.classList.toggle('loader')

            //make result hidden 
            hideIPInfoBlock()

            errorDisplayNode.innerText = "ERROR: Could not fetch information."
        })
})

function hideIPInfoBlock(){
    //make result hidden 
    for(let node of ipInfoBlockNode){
        node.style.visibility = 'hidden'
    }
}

function showIPInfoBlock(){
    for(let node of ipInfoBlockNode){
        node.style.visibility = 'visible'
    }
}

//fetch the users api
async function getIPAddress(ipAddress=''){
    //create necesary string to query the api
    const apiKey = 'at_BSdrpKxLckMWLsn8oZJ3A8y01M4eY'
    let link = `https://geo.ipify.org/api/v1?apiKey=${apiKey}&ipAddress=${ipAddress}`

    //query api
    let ipPromise = await fetch(link)

    //check rewsponse was sucessfull
    //otherwise throw error
    if(!ipPromise.ok)
    {    
        throw new Error(`ERROR: ${ipPromise.status}`)
    }

    //return json format
    return await ipPromise.json()
}

//function used to render the users IP information
function updateDOM(jsonResponse){
    //get results to update the DOM
    let {city, region, postalCode, timezone, lat, lng} = jsonResponse.location
    let isp = jsonResponse.isp.slice(0, 13)
    let ipAddress = jsonResponse.ip

    //get abbreviation of the state
    let stateAbbreviations = abbreviation(region, 2)
    stateAbbreviations = stateAbbreviations == null ? region : stateAbbreviations

    //update the DOM
    ipAddressNode.innerText = jsonResponse.ip
    ipLocationNode.innerText = `${city}, ${stateAbbreviations} ${postalCode}`
    ipTimeZoneNode.innerText = `UTC ${timezone}`
    ipISPNode.innerText = `${isp}`
    ipInputNode.value = ipAddress

    //turn loader off
    loaderNode.classList.toggle('loader')

    //hide text just incase it is shown
    errorDisplayNode.innerText = ""

    //make result visible 
    showIPInfoBlock()

    //show users location on map
    renderMap(lat, lng)
}

//will display user's location on map
function renderMap(lat , lng){
    mymap.setView([lat, lng], 13);

    //sets up tile and map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiamRiamZsIiwiYSI6ImNrcHJpODFpMDBmY2Iyb3Z6cnR0MWpqdjQifQ.roj5KdobPjnTg2iCShTdeA'
    }).addTo(mymap);

    
    L.marker([lat, lng], {icon: myIcon}).addTo(mymap);
}

getIPAddress()
    .then(jsonResponse => {
        updateDOM(jsonResponse)
    })
    .catch( error => {
        //hide loader
        loaderNode.classList.toggle('loader')

        //make result hidden 
        hideIPInfoBlock()

        errorDisplayNode.innerText = "ERROR: Could not fetch information."
    })