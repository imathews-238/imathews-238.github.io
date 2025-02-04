// Initialize the Leaflet map
const map = L.map('map').setView([39.5, -98.35], 4); // Default view over the USA

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define custom cell tower icon
const towerIcon = L.icon({
  iconUrl: 'https://imathews-238.github.io/CE514/cell_map_marker.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

// Store all layers globally
let layers = {};
const layerUrls = {
  majorRoads: 'https://imathews-238.github.io/CE514/UC_major_roads.kml',
  countyBoundary: 'https://imathews-238.github.io/CE514/Utah_county_boundary.kml',
  cellTowers: 'https://imathews-238.github.io/CE514/UC_cell_towers.kml',
  states: 'https://imathews-238.github.io/CE514/States_kml.kml',
  ghana: 'https://imathews-238.github.io/CE514/Ghanakml.kml'
};

// Function to load KML layers
function loadKML(url, layerName, customStyle, customIcon) {
  omnivore.kml(url).on('ready', function () {
    let layer = this;

    if (customStyle) {
      layer.setStyle(customStyle);
    }

    if (customIcon) {
      layer.eachLayer(marker => {
        if (marker instanceof L.Marker) {
          marker.setIcon(customIcon);
          marker.bindPopup("Cell Phone Tower");
        }
      });
    }

    layers[layerName] = layer;
    map.addLayer(layer);
  });
}

// Load all KMLs initially
loadKML(layerUrls.majorRoads, "majorRoads");
loadKML(layerUrls.countyBoundary, "countyBoundary");
loadKML(layerUrls.cellTowers, "cellTowers", null, towerIcon);
loadKML(layerUrls.states, "states");
loadKML(layerUrls.ghana, "ghana", { color: "blue" });

// Define bounding coordinates for every U.S. state and Ghana
// Coordinates are defined as: [ [southwest_lat, southwest_lng], [northeast_lat, northeast_lng] ]
const stateBounds = {
  "alabama": [[30.220, -88.473], [35.008, -84.888]],
  "alaska": [[51.214, -179.148], [71.365, 179.778]],
  "arizona": [[31.332, -114.816], [37.004, -109.045]],
  "arkansas": [[33.004, -94.617], [36.499, -89.644]],
  "california": [[32.534, -124.409], [42.009, -114.131]],
  "colorado": [[36.993, -109.060], [41.003, -102.041]],
  "connecticut": [[40.950, -73.727], [42.050, -71.786]],
  "delaware": [[38.451, -75.788], [39.839, -74.864]],
  "florida": [[24.396, -87.634], [31.000, -80.031]],
  "georgia": [[30.357, -85.605], [35.000, -80.840]],
  "hawaii": [[18.911, -160.247], [22.235, -154.806]],
  "idaho": [[42.000, -117.243], [49.001, -111.043]],
  "illinois": [[36.970, -91.512], [42.508, -87.494]],
  "indiana": [[37.771, -88.097], [41.761, -84.784]],
  "iowa": [[40.375, -96.639], [43.501, -90.140]],
  "kansas": [[36.993, -102.051], [40.003, -94.588]],
  "kentucky": [[36.497, -89.571], [39.147, -81.964]],
  "louisiana": [[28.928, -94.043], [33.019, -88.817]],
  "maine": [[43.064, -71.084], [47.459, -66.949]],
  "maryland": [[37.911, -79.487], [39.723, -74.955]],
  "massachusetts": [[41.237, -73.508], [42.886, -69.928]],
  "michigan": [[41.696, -90.418], [48.306, -82.413]],
  "minnesota": [[43.501, -97.239], [49.384, -89.489]],
  "mississippi": [[30.173, -91.655], [34.996, -88.098]],
  "missouri": [[35.995, -95.774], [40.613, -89.098]],
  "montana": [[44.358, -116.049], [49.001, -104.039]],
  "nebraska": [[39.999, -104.053], [43.001, -95.308]],
  "nevada": [[35.001, -120.005], [42.001, -114.039]],
  "new_hampshire": [[42.697, -72.557], [45.305, -70.610]],
  "new_jersey": [[38.928, -75.558], [41.357, -73.893]],
  "new_mexico": [[31.332, -109.050], [37.000, -103.001]],
  "new_york": [[40.496, -79.762], [45.015, -71.856]],
  "north_carolina": [[33.842, -84.321], [36.588, -75.460]],
  "north_dakota": [[45.935, -104.048], [49.000, -96.554]],
  "ohio": [[38.403, -84.820], [41.978, -80.518]],
  "oklahoma": [[33.616, -103.002], [37.002, -94.430]],
  "oregon": [[41.991, -124.566], [46.292, -116.463]],
  "pennsylvania": [[39.720, -80.520], [42.269, -74.689]],
  "rhode_island": [[41.146, -71.120], [42.018, -70.986]],
  "south_carolina": [[32.034, -83.353], [35.215, -78.542]],
  "south_dakota": [[42.479, -104.057], [45.945, -96.436]],
  "tennessee": [[34.982, -90.310], [36.678, -81.646]],
  "texas": [[25.837, -106.645], [36.500, -93.508]],
  "utah": [[37.0, -114.0], [42.0, -109.0]],
  "vermont": [[42.726, -73.437], [45.016, -71.510]],
  "virginia": [[36.540, -83.675], [39.466, -75.242]],
  "washington": [[45.543, -124.848], [49.002, -116.916]],
  "west_virginia": [[37.201, -82.644], [40.638, -77.719]],
  "wisconsin": [[42.491, -92.889], [47.306, -86.250]],
  "wyoming": [[40.994, -111.056], [45.005, -104.052]],
  // Ghana bounds
  "ghana": [[4.5, -3.3], [11.2, 1.2]]
};

// Function to zoom to a selected location from dropdown
function zoomToLocation(selectedLocation) {
  // If nothing or 'none' is selected, reset to a global view
  if (!selectedLocation || selectedLocation === "none") {
    console.log("Resetting view to Earth");
    map.setView([20, 0], 2);
    document.getElementById("viewing").innerText = "Earth";
    return;
  }

  // Convert to lower case to match keys in stateBounds
  selectedLocation = selectedLocation.toLowerCase();
  if (stateBounds[selectedLocation]) {
    // Create a Leaflet LatLngBounds object from the coordinate array
    let bounds = L.latLngBounds(stateBounds[selectedLocation]);
    console.log(`Zooming to ${selectedLocation}:`, bounds);
    map.fitBounds(bounds);
    document.getElementById("viewing").innerText =
      selectedLocation.charAt(0).toUpperCase() + selectedLocation.slice(1);
  } else {
    console.error("Coordinates for the selected location are not defined!");
    alert("Coordinates for the selected location are not defined!");
  }
}
