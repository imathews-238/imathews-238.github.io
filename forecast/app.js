
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
    { name: "South Platte River", lat: 40.167, lon: -104.833 }
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
        .on('click', function() { updateChart(point.name, flowRate); });
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
    if (flowRate > 4000) {
        statusCard.innerHTML = `⚠️ WARNING: Flow at ${riverName} is HIGH! Dangerous conditions.`;
        statusCard.className = "danger";
    } else if (flowRate < 1500) {
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