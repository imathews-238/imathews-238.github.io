const map = L.map('map').setView([38.85, -104.85], 10); // Set initial view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function loadKML(url) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`Failed to load ${url}`);
            return res.text();
        })
        .then(kmltext => {
            var parser = new DOMParser();
            var kml = parser.parseFromString(kmltext, 'text/xml');
            var track = new L.KML(kml);
            map.addLayer(track);
            console.log(`Loaded ${url}`);
        })
        .catch(error => console.error(error));
}

loadKML('https://imathews-238.github.io/CE514/UC_cell_towers.kml');
loadKML('https://imathews-238.github.io/CE514/UC_major_roads.kml');
loadKML('https://imathews-238.github.io/CE514/Utah_county_boundary.kml');


locations.forEach(location => {
    L.marker(location.coords).addTo(map).bindPopup("Cell Phone Tower");
});
