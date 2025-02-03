// Create the Leaflet map without setting a view initially (will auto-zoom later)
const map = L.map('map');

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to load and add KML layers with optional click behavior
function loadKML(url, onEachFeature) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`Failed to load ${url}`);
            return res.text();
        })
        .then(kmltext => {
            var parser = new DOMParser();
            var kml = parser.parseFromString(kmltext, 'text/xml');
            var track = new L.KML(kml);

            if (onEachFeature) {
                track.eachLayer(layer => {
                    onEachFeature(layer);
                });
            }

            map.addLayer(track);
            console.log(`Loaded ${url}`);
        })
        .catch(error => console.error(error));
}

// Load major roads KML with click event
loadKML('https://imathews-238.github.io/CE514/UC_major_roads.kml', layer => {
    layer.on('click', function () {
        alert(`Road: ${layer.feature?.properties?.name || "Unknown Road"}`);
    });
});

// Load Utah County boundary KML with click event
loadKML('https://imathews-238.github.io/CE514/Utah_county_boundary.kml', layer => {
    layer.on('click', function () {
        alert("Utah County");
    });
});

// Define custom cell tower icon
const towerIcon = L.icon({
    iconUrl: 'https://imathews-238.github.io/CE514/cell_map_marker.png',
    iconSize: [30, 30],  // Scales well based on zoom level
    iconAnchor: [15, 30], // Center bottom anchor
    popupAnchor: [0, -30] // Adjust popup positioning
});

// Create a feature group for cell towers (for auto-zooming)
const markerGroup = L.featureGroup().addTo(map);

// Load cell tower KML using Leaflet-Omnivore
omnivore.kml('https://imathews-238.github.io/CE514/UC_cell_towers.kml')
    .on('ready', function (e) {
        const layer = e.target;
        layer.eachLayer(marker => {
            if (marker instanceof L.Marker) {
                marker.setIcon(towerIcon);
                marker.bindPopup("Cell Phone Tower");
                markerGroup.addLayer(marker);
            }
        });

        // Fit map to marker bounds after loading
        if (markerGroup.getLayers().length > 0) {
            map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
        }
    })
    .addTo(map);

var LocationLayers = {};  // Object to store country layers

function init() {
    // Initialize the map and set the global view
    map = L.map("map_id").setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Load KML files into countryLayers object
    let Location = ["australia", "bahrain", "canada", "cayman", "czechia", "england", 
                     "france", "germany", "japan", "mexico", "spain", "switzerland", 
                     "thailand", "thenetherlands", "usa", "vietnam"];
    
    countries.forEach(Location => {
        LocationLayers[country] = omnivore.kml(`kml/${Location}.kml`).on('ready', function() {
            this.setStyle({color: "blue"});  // Optional: Set country boundary color
        });
    });

    // Reset view to the world
    setLocation("none");
}

function setLocation(theLocation) {
    console.log("Selected:", theLocation);

    // Remove all layers before adding a new one
    Object.values(LocationLayers).forEach(layer => map.removeLayer(layer));

    if (theCountry !== "none") {
        let selectedLayer = LocationLayers[theLocation];
        if (selectedLayer) {
            map.addLayer(selectedLayer);
            map.fitBounds(selectedLayer.getBounds());
            document.getElementById("viewing").innerText = fullName(theLocation);
        }
    } else {
        map.setView([20, 0], 2);
        document.getElementById("viewing").innerText = "Earth";
    }
}

function fullName(country) {
    const names = {
        "england": "United Kingdom",
        "usa": "United States of America",
        "thenetherlands": "The Netherlands",
        "cayman": "Cayman Islands"
    };
    return names[country] || country.charAt(0).toUpperCase() + country.slice(1);
}
