// Initialize Leaflet Map
var map = L.map('map').setView([39.5501, -105.7821], 8);

// Add OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// // Example River Points
// var riverPoints = [
//     { name: "Arkansas River", lat: 38.842, lon: -106.133 },
//     { name: "Colorado River", lat: 39.368, lon: -107.728 },
//     { name: "South Platte River", lat: 40.167, lon: -104.833 },
//     { name: "Gunnison River", lat: 38.544, lon: -107.324 },
//     { name: "Rio Grande River", lat: 37.669, lon: -106.388 }
// ];

// // Function to get marker color
// function getMarkerColor(flow) {
//     if (flow > 1500) return "red"; 
//     if (flow < 1499) return "orange"; 
//     return "green"; 
// }

// // Add Points to Map
// riverPoints.forEach(point => {
//     var flowRate = Math.floor(Math.random() * (5000 - 800) + 800);
//     var markerColor = getMarkerColor(flowRate);
//     var marker = L.circleMarker([point.lat, point.lon], {
//         radius: 8,
//         fillColor: markerColor,
//         color: "#000",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8
//     }).addTo(map)
//         .bindPopup(`<b>${point.name}</b><br>Click for flow data`)
//         .on('click', function() { 
//             updateChart(point.name, flowRate); 
//             getForecast(layerUrls[point.name].reachId, point.name); // Call getForecast with reachId and river name
//         });
// });
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

// Add this function to get return periods for a specific reach ID
function getReturnPeriods(reachId) {
    const returnPeriods = {
        bands: [],
        values: {}
    };
    
    // Find the index of the reach ID in the JSON data

    const nwm_stream_return_periods = {
        "feature_id": {
          "0": 226585,
          "1": 976192,
          "2": 3176028,
          "3": 3233525,
          "4": 17900377
        },
        "return_period_2": {
          "0": 422.29,
          "1": 210.23,
          "2": 578.44,
          "3": 246.41,
          "4": 306.99
        },
        "return_period_5": {
          "0": 632.83,
          "1": 301.13,
          "2": 802.96,
          "3": 369.76,
          "4": 546.14
        },
        "return_period_10": {
          "0": 772.22,
          "1": 361.32,
          "2": 951.61,
          "3": 451.43,
          "4": 704.47
        },
        "return_period_25": {
          "0": 948.34,
          "1": 437.37,
          "2": 1139.43,
          "3": 554.61,
          "4": 904.53
        },
        "return_period_50": {
          "0": 1079,
          "1": 493.78,
          "2": 1278.77,
          "3": 631.16,
          "4": 1052.94
        },
        "return_period_100": {
          "0": 1208.7,
          "1": 549.78,
          "2": 1417.08,
          "3": 707.14,
          "4": 1200.26
        }
      };
    
    const index = Object.values(nwm_stream_return_periods.feature_id)
        .findIndex(id => id === reachId);
        console.log('index', index)
    
    if (index !== -1) {
        // Get all return period values for this reach
        returnPeriods.values = {
            '2_year': nwm_stream_return_periods.return_period_2[index],
            '5_year': nwm_stream_return_periods.return_period_5[index],
            '10_year': nwm_stream_return_periods.return_period_10[index],
            '25_year': nwm_stream_return_periods.return_period_25[index],
            '50_year': nwm_stream_return_periods.return_period_50[index],
            '100_year': nwm_stream_return_periods.return_period_100[index]
        };

    }
    
    return returnPeriods;
}

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

                    // Format timestamps to readable format
                    const readableTimestamps = timestamps.map(timestamp => {
                        const date = new Date(timestamp);
                        return date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric'
                        });
                    });
                    
                    flowChart.data.labels = readableTimestamps;
                    flowChart.data.datasets[0].data = flowValues;
                    flowChart.data.datasets[0].label = `${riverName} Flow - ${forecastType.replace('_', ' ').toUpperCase()}`;
                    flowChart.update();

                    // Update status card based on current flow
                    const statusCard = document.getElementById("status-card");
                    if (maxflow > 1400) {
                        statusCard.innerHTML = `⚠️ WARNING: Flow at ${riverName} is HIGH! Dangerous conditions.`;
                        statusCard.className = "danger";
                    } else if (maxflow < 1400) {
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

                    const returnPeriods = getReturnPeriods(reachId);

                    console.log('returnPeriods', returnPeriods)

                    // Add a horizontal line dataset
                    flowChart.data.datasets[1] = {
                        label: '2 Year',
                        data: Array(timestamps.length).fill(returnPeriods.values['2_year']), // Replace 1000 with your desired fixed value
                        borderColor: 'green',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false
                    };

                    flowChart.data.datasets[2] = {
                        label: '5 Year',
                        data: Array(timestamps.length).fill(returnPeriods.values['5_year']), // Replace 1000 with your desired fixed value
                        borderColor: 'yellow',
                        borderWidth: 1,
                        borderDash: [5, 5], 
                        fill: false
                    };

                    flowChart.data.datasets[3] = {
                        label: '10 Year',
                        data: Array(timestamps.length).fill(returnPeriods.values['10_year']), // Replace 1000 with your desired fixed value
                        borderColor: 'orange',
                        borderWidth: 1,
                        borderDash: [5, 5], 
                        fill: false
                    };

                    flowChart.data.datasets[4] = {
                        label: '25 Year',
                        data: Array(timestamps.length).fill(returnPeriods.values['25_year']), // Replace 1000 with your desired fixed value
                        borderColor: 'brown',
                        borderWidth: 1,
                        borderDash: [5, 5], 
                        fill: false
                    };

                    flowChart.data.datasets[5] = {
                        label: '50 Year',
                        data: Array(timestamps.length).fill(returnPeriods.values['50_year']), // Replace 1000 with your desired fixed value
                        borderColor: 'red',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false
                    };

                    flowChart.data.datasets[6] = {
                        label: '100 Year',
                        data: Array(timestamps.length).fill(returnPeriods.values['100_year']), // Replace 1000 with your desired fixed value
                        borderColor: 'purple',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false
                    };

                    
                    // Update the chart with return period lines instead of bands
                    flowChart.options = {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Flow (CFS)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time'
                                }
                            }
                        }
                    };
                    
                    flowChart.update();

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
                
                // Get bounds of both layers and fit map to those bounds
                const basinBounds = basinLayer.getBounds();
                const riverBounds = riverLayer.getBounds();
                const combinedBounds = basinBounds.extend(riverBounds);
                map.fitBounds(combinedBounds, { padding: [50, 50] });
            } else {
                // If already loaded, add both layers back to the map
                map.addLayer(layers[`${layerId}-basin`]);
                map.addLayer(layers[`${layerId}-river`]);
                
                // Fit map to combined bounds of existing layers
                const basinBounds = layers[`${layerId}-basin`].getBounds();
                const riverBounds = layers[`${layerId}-river`].getBounds();
                const combinedBounds = basinBounds.extend(riverBounds);
                map.fitBounds(combinedBounds, { padding: [50, 50] });
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

