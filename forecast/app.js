// Initialize Leaflet Map
var map = L.map('map').setView([39.5501, -105.7821], 8);

// Add OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Example River Points
var riverPoints = [
    { name: "Arkansas River", lat: 38.842, lon: -106.133 },
    { name: "Colorado River", lat: 39.368, lon: -107.728 },
    { name: "South Platte River", lat: 40.167, lon: -104.833 },
    { name: "Gunnison River", lat: 38.544, lon: -107.324 },
    { name: "Rio Grande River", lat: 37.669, lon: -106.388 }
];

// Function to get marker color
function getMarkerColor(flow) {
    if (flow > 4000) return "red"; 
    if (flow < 1500) return "orange"; 
    return "green"; 
}

// Add Points to Map
riverPoints.forEach(point => {
    var flowRate = Math.floor(Math.random() * (5000 - 800) + 800);
    var markerColor = getMarkerColor(flowRate);
    var marker = L.circleMarker([point.lat, point.lon], {
        radius: 8,
        fillColor: markerColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map)
        .bindPopup(`<b>${point.name}</b><br>Click for flow data`)
        .on('click', function() { 
            updateChart(point.name, flowRate); 
            getForecast(layerUrls[point.name].reachId, point.name); // Call getForecast with reachId and river name
        });
});
// Chart.js Setup
var ctx = document.getElementById('flowChart').getContext('2d');
var flowChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Flow Rate (CFS)', data: [], borderColor: 'blue' }] },
    options: { responsive: true }
});

// Function to Update Chart & Status
function updateChart(riverName, flowRate) {
    var forecastType = document.getElementById('forecast-select').value;
    var flowData = generateMockData(); 

    flowChart.data.labels = flowData.dates;
    flowChart.data.datasets[0].data = flowData.values;
    flowChart.data.datasets[0].label = `${riverName} Flow - ${forecastType}`;
    flowChart.update();

    var statusCard = document.getElementById("status-card");
    if (flowRate > 1500) {
        statusCard.innerHTML = `⚠️ WARNING: Flow at ${riverName} is HIGH! Dangerous conditions.`;
        statusCard.className = "danger";
    } else if (flowRate < 1000) {
        statusCard.innerHTML = `⚠️ Flow at ${riverName} is LOW. Poor conditions.`;
        statusCard.className = "caution";
    } else {
        statusCard.innerHTML = `✅ Flow at ${riverName} is safe for recreation.`;
        statusCard.className = "safe";
    }
}

function generateMockData() {
    var dates = [], values = [];
    for (var i = 0; i < 7; i++) {
        dates.push(`Day ${i+1}`);
        values.push(Math.floor(Math.random() * (5000 - 800) + 800));
    }
    return { dates, values };
}

// Store all layers globally
let layers = {};
const layerUrls = {
    'Arkansas River': {
        basin: 'Arkansas_Basin.kml',
        river: 'Arkansas.kml',
        reachId: 976192
    },
    'Colorado River': {
        basin: 'Colorado_Basin.kml',
        river: 'Colorado.kml',
        reachId: 3176028
    },
    'Gunnison River': {
        basin:'Gunnison_Basin.kml',
        river: 'Gunnison.kml',
        reachId: 3233525
    },
    'Rio Grande River': {
        basin: 'Rio_Grande_Basin.kml',
        river: 'Rio_Grande.kml',
        reachId: 17900377
    },
    'South Platte River': {
        basin: 'South_Platte_Basin.kml',
        river: 'South_Platte.kml',
        reachId: 226585
    }
};


// Function to load KML layers
function loadKML(url, layerName) {
    console.log('We are loading the KML')
    return new Promise((resolve) => {
      omnivore.kml(url).on('ready', function() {
        console.log('omnivore on ready')

        let layer = this;

        // Add click handler for river layers
        if (layerName.endsWith('-river')) {
            const riverName = layerName.replace('-river', '');
            
            // Style function to update river color
            function updateRiverColor(flow) {
                layer.eachLayer(function(riverSegment) {
                    let color;
                    if (flow > 1400) {
                        color = '#ff0000'; // red for dangerous conditions
                    } else if (flow < 1300) {
                        color = '#ffa500'; // orange for poor conditions
                    } else {
                        color = '#008000'; // green for safe conditions
                    }
                    
                    riverSegment.setStyle({
                        color: color,
                        weight: 4,
                        opacity: 0.8
                    });
                });
            }

            layer.on('click', async function(e) {
                // Remove existing click marker if any
                if (window.clickMarker) {
                    map.removeLayer(window.clickMarker);
                }
                
                // Add new marker at click location
                window.clickMarker = L.marker(e.latlng).addTo(map);
                
                try {
                    const reachId = layerUrls[riverName].reachId;
                    const forecastType = document.getElementById('forecastTypeSelect').value;
                    const apiUrl = `https://api.water.noaa.gov/nwps/v1/reaches/${reachId}/streamflow?series=${forecastType}`;
                    
                    const response = await fetch(apiUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error status: ${response.status} - ${response.statusText}`);
                    }

                    const json_data = await response.json();

                    console.log('response', json_data)
                    let streamflowData = [];

                    // Process the data based on forecast type
                    switch (forecastType) {
                        case 'short_range':
                            if (json_data.shortRange?.series?.data) {
                                streamflowData = json_data.shortRange.series.data;
                            }
                            break;
                        case 'medium_range':
                            if (json_data.mediumRange) {
                                Object.values(json_data.mediumRange).forEach(range => {
                                    if (range.data) streamflowData = streamflowData.concat(range.data);
                                });
                            }
                            break;
                        case 'long_range':
                            if (json_data.longRange) {
                                Object.values(json_data.longRange).forEach(range => {
                                    if (range.data) streamflowData = streamflowData.concat(range.data);
                                });
                            }
                            break;
                    }

                    if (streamflowData.length === 0) {
                        throw new Error(`No ${forecastType.replace('_', ' ')} forecast data available for this location.`);
                    }

                    const timestamps = streamflowData.map(item => item.validTime);
                    const flowValues = streamflowData.map(item => item.flow);
                    const currentFlow = flowValues[0];
                    const maxflow = Math.max(...flowValues);
                    console.log('maxflow', maxflow)

                    // Update river color based on current flow
                    updateRiverColor(maxflow);

                    // Update the chart
                    flowChart.data.labels = timestamps;
                    flowChart.data.datasets[0].data = flowValues;
                    flowChart.data.datasets[0].label = `${riverName} Flow - ${forecastType.replace('_', ' ').toUpperCase()}`;
                    flowChart.update();

                    // Update status card based on current flow
                    const statusCard = document.getElementById("status-card");
                    if (maxflow > 1400) {
                        statusCard.innerHTML = `⚠️ WARNING: Flow at ${riverName} is HIGH! Dangerous conditions.`;
                        statusCard.className = "danger";
                    } else if (maxflow < 1200) {
                        statusCard.innerHTML = `⚠️ Flow at ${riverName} is LOW. Poor conditions.`;
                        statusCard.className = "caution";
                    } else {
                        statusCard.innerHTML = `✅ Flow at ${riverName} is safe for recreation.`;
                        statusCard.className = "safe";
                    }

                    // Update marker popup with current flow
                    window.clickMarker.bindPopup(
                        `${riverName}<br>Current Flow: ${currentFlow.toFixed(2)} CFS`
                    ).openPopup();

                } catch (error) {
                    console.error('Error fetching forecast:', error);
                    window.clickMarker.bindPopup(
                        `Error fetching forecast data for ${riverName}: ${error.message}`
                    ).openPopup();
                }
            });
        }

        layer.eachLayer(marker => {
            if (marker instanceof L.Marker) {
                marker.bindPopup("Cell Phone Tower");
            }
        });

        layers[layerName] = layer;
        resolve(layer);
      });
    });
}



for (var layerName in layerUrls) {
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = layerName;
    checkbox.checked = false;

    var label = document.createElement('label');
    label.htmlFor = layerName;
    label.textContent = layerName;

    var div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);

    document.getElementById('layer-controls').appendChild(div);

    checkbox.addEventListener('change', async function(e) {
        const layerId = e.target.id;
        if (e.target.checked) {
            if (!layers[`${layerId}-basin`]) {
                // Load both basin and river KMLs
                const basinLayer = await loadKML(layerUrls[layerId].basin, `${layerId}-basin`);
                const riverLayer = await loadKML(layerUrls[layerId].river, `${layerId}-river`);
                map.addLayer(basinLayer);
                map.addLayer(riverLayer);
            } else {
                // If already loaded, add both layers back to the map
                map.addLayer(layers[`${layerId}-basin`]);
                map.addLayer(layers[`${layerId}-river`]);
            }
        } else {
            // Remove both layers
            if (layers[`${layerId}-basin`]) {
                map.removeLayer(layers[`${layerId}-basin`]);
                map.removeLayer(layers[`${layerId}-river`]);
            }
        }
    });
}

