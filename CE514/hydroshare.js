var map = L.map('map').setView([13.7942, -88.8965], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var layers = {
    'Basin Catchments': L.tileLayer.wms('https://geoserver.hydroshare.org/geoserver/HS-0fb36c45e61644e69ac73641aa258f4c/wms', {
        layers: 'HS-0fb36c45e61644e69ac73641aa258f4c:El_Salvador_Catchments',
        format: 'image/png',
        transparent: true,
        attribution: 'Hydroshare GeoServer'
    }),
    'Streams': L.tileLayer.wms('https://geoserver.hydroshare.org/geoserver/HS-0fb36c45e61644e69ac73641aa258f4c/wms', {
        layers: 'HS-0fb36c45e61644e69ac73641aa258f4c:EL_Salvador_Clipped_Streams',
        format: 'image/png',
        transparent: true,
        attribution: 'Hydroshare GeoServer'
    }),
    'Cities': L.tileLayer.wms('https://geoserver.hydroshare.org/geoserver/HS-0fb36c45e61644e69ac73641aa258f4c/wms', {
        layers: 'HS-0fb36c45e61644e69ac73641aa258f4c:El_Salvador_Cities',
        format: 'image/png',
        transparent: true,
        attribution: 'Hydroshare GeoServer'
    }),
};

for (var layerName in layers) {
    var layer = layers[layerName];
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = layerName;
    checkbox.checked = false; // Initially off

    var label = document.createElement('label');
    label.htmlFor = layerName;
    label.textContent = layerName;

    var div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);

    document.getElementById('layer-controls').appendChild(div);

    checkbox.addEventListener('change', function(e) {
        if (e.target.checked) {
            map.addLayer(layers[e.target.id]);
        } else {
            map.removeLayer(layers[e.target.id]);
        }
    });
}
