const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetch('https://imathews-238.github.io/CE514/UC_cell_towers.kml') // Ensure this KML file is accessible
    .then(res => res.text())
    .then(kmltext => {
        var parser = new DOMParser();
        var kml = parser.parseFromString(kmltext, 'text/xml');
        var track = new L.KML(kml);
        map.addLayer(track);
        map.fitBounds(track.getBounds());
    });

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
