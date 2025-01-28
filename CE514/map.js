const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const locations = [
    { name: "My House", coords: [38.9011, -104.77125] },
    { name: "William J. Palmer High School", coords: [38.839422463309546, -104.82074570592077] },
    { name: "Church of Jesus Christ of Latter-day Saints", coords: [38.87115396280131, -104.79815034137457] },
    { name: "Garden of the Gods", coords: [38.8783, -104.8691] },
    { name: "Pikes Peak", coords: [38.8409, -105.0423] }
];

locations.forEach(location => {
    L.marker(location.coords).addTo(map).bindPopup(location.name);
});

const homeBoundary = [
    [38.9012, -104.7712],
    [38.9012, -104.7713],
    [38.90107, -104.7713],
    [38.90107, -104.7712]
];
L.polygon(homeBoundary, { color: 'blue' }).addTo(map).bindPopup("Home Property");

L.circle([38.90161464861117, -104.7712603022105], {
    color: 'green',
    fillColor: '#0f0',
    fillOpacity: 0.5,
    radius: 800 // Roughly 10 minutes walking distance
}).addTo(map).bindPopup("10-minute Walking Radius");

const dynamicLayer = L.layerGroup().addTo(map);

const allCoords = locations.map(location => location.coords);
const bounds = L.latLngBounds(allCoords);
map.fitBounds(bounds);

function great_circle(lat1, lng1, lat2, lng2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;

    const d = 2 * Math.asin(Math.sqrt(Math.sin((toRad(lat2) - toRad(lat1)) / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin((toRad(lng2) - toRad(lng1)) / 2) ** 2));

    const num_segments = 100;
    const points = [];

    for (let i = 0; i <= num_segments; i++) {
        const f = i / num_segments;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(toRad(lat1)) * Math.cos(toRad(lng1)) + B * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2));
        const y = A * Math.cos(toRad(lat1)) * Math.sin(toRad(lng1)) + B * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2));
        const z = A * Math.sin(toRad(lat1)) + B * Math.sin(toRad(lat2));
        const new_lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const new_lng = Math.atan2(y, x);
        points.push([toDeg(new_lat), toDeg(new_lng)]);
    }

    L.polyline(points, { color: 'red' }).addTo(dynamicLayer);
}

document.getElementById('distance-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const point1 = document.getElementById('point1').value.split(',').map(Number);
    const point2 = document.getElementById('point2').value.split(',').map(Number);

    if (point1.length !== 2 || point2.length !== 2 || isNaN(point1[0]) || isNaN(point1[1]) || isNaN(point2[0]) || isNaN(point2[1])) {
        alert('Please enter valid coordinates.');
        return;
    }

    dynamicLayer.clearLayers();

    const R = 6371; // Earth's radius in km
    const toRad = deg => deg * Math.PI / 180;

    const [lat1, lon1] = point1.map(toRad);
    const [lat2, lon2] = point2.map(toRad);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    document.getElementById('distance-result').textContent = `Distance: ${distance.toFixed(2)} km`;

    // Add markers to the map
    L.marker(point1).addTo(dynamicLayer).bindPopup("Point 1").openPopup();
    L.marker(point2).addTo(dynamicLayer).bindPopup("Point 2").openPopup();

    // Draw great circle path
    great_circle(point1[0], point1[1], point2[0], point2[1]);

    // Fit map to bounds of the two points with padding for better visibility
    const bounds = L.latLngBounds([point1, point2]);
    map.fitBounds(bounds, { padding: [100, 100] });
});
