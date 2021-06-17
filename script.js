import abbreviation from './stateAbbreviations.js';

const ipAddressNode = document.getElementById('ip-address')
const ipLocationNode = document.getElementById('ip-location')
const ipTimeZoneNode = document.getElementById('ip-timezone')
const ipISPNode = document.getElementById('ip-isp')
const ipInputNode = document.getElementById('ipInput')
const ipSubmitBttn = document.getElementById('ip-submit')
const ipInfoBlockNode = document.getElementsByClassName('ip-info-block')
const loaderNode = document.getElementsByClassName('loader')[0]

let mymap = L.map('mapid', 
    {
        zoomControl: false,
        center: [90.505, -0.09]
    }
)

//query an ip if it clicked
ipSubmitBttn.addEventListener('click', () =>{
    const apiAddress = ipInputNode.value
    getIPAddress(apiAddress)
})

//fetch the users api
async function getIPAddress(ipAddress=''){
    //create necesary string to query the api
    const apiKey = 'at_BSdrpKxLckMWLsn8oZJ3A8y01M4eY'
    let link = `https://geo.ipify.org/api/v1?apiKey=${apiKey}&ipAddress=${ipAddress}`
    
    try{
        //query api
        let ipPromise = await fetch(link)
        let jsonResponse = await ipPromise.json()
        
        updateDOM(jsonResponse)
    }catch(err){
        console.log(err)
    }
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

    //make result visible 
    for(let node of ipInfoBlockNode){
        node.style.visibility = 'visible'
    }
    
    //hide loader
    loaderNode.style.visibility = 'hidden'

    renderMap(lat, lng)
}

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

    //sets up the icon of the map
    let myIcon = L.icon({
        iconUrl: 'images/icon-location.svg',
        iconSize: [38, 45],
        iconAnchor: [22, 45],
        popupAnchor: [-3, -76],
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });
    L.marker([lat, lng], {icon: myIcon}).addTo(mymap);
}

getIPAddress()

