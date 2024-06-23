// Objeto para encapsular variables globales
const App = {
    map: null,
    kdTree: null,
    deliveryMarker: null,
    clientMarkers: [],
    nearestClientMarker: null,
    pathToNearestClient: null
};

// Función para inicializar el mapa de Google
function initMap() {
    const puno = { lat: -15.8402, lng: -70.0219 };

    App.map = new google.maps.Map(document.getElementById('map'), {
        center: puno,
        zoom: 13
    });

    initDeliveryMarker(puno);
    initClientPoints();

    // Eventos
    google.maps.event.addListener(App.deliveryMarker, 'dragend', updateNearestClient);
    google.maps.event.addListener(App.map, 'click', function(event) {
        App.deliveryMarker.setPosition(event.latLng);
        updateNearestClient();
    });

    document.getElementById('btnAddClient').addEventListener('click', addClient);
    document.getElementById('btnClearClients').addEventListener('click', clearClients);
}

// Inicializar el marcador de entrega
function initDeliveryMarker(position) {
    App.deliveryMarker = new google.maps.Marker({
        position: position,
        map: App.map,
        draggable: true,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/micons/motorcycling.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        title: 'Moto de entrega'
    });
}

// Inicializar los puntos de clientes
function initClientPoints() {
    const clientPoints = [
        { lat: -15.8376, lng: -70.0190 },
        { lat: -15.8365, lng: -70.0181 }
        // Agregar más puntos de clientes si es necesario
    ];

    clientPoints.forEach(point => addClientMarker(point));
    App.kdTree = new KDTree(clientPoints.map(point => [point.lat, point.lng]));
    updateNearestClient();
}

// Función para agregar un nuevo punto de cliente
function addClient() {
    const clientLocation = {
        lat: getRandomInRange(-15.845, -15.835),
        lng: getRandomInRange(-70.025, -70.015)
    };

    addClientMarker(clientLocation);
    App.kdTree.insert([clientLocation.lat, clientLocation.lng]);
    updateNearestClient();
}

// Función para agregar un marcador de cliente al mapa
function addClientMarker(location) {
    const clientMarker = new google.maps.Marker({
        position: location,
        map: App.map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    App.clientMarkers.push(clientMarker);
}

// Función para limpiar todos los puntos de clientes
function clearClients() {
    App.clientMarkers.forEach(marker => {
        marker.setVisible(false); // Ocultar marcador en lugar de quitarlo
    });

    App.kdTree = new KDTree([]);
    clearNearestClient();
}

// Función para actualizar y mostrar el cliente más cercano
function updateNearestClient() {
    const deliveryLocation = {
        lat: App.deliveryMarker.getPosition().lat(),
        lng: App.deliveryMarker.getPosition().lng()
    };

    const nearestClient = App.kdTree.findNearest([deliveryLocation.lat, deliveryLocation.lng]);

    if (nearestClient) {
        const nearestClientLatLng = new google.maps.LatLng(nearestClient[0], nearestClient[1]);

        if (!App.nearestClientMarker) {
            App.nearestClientMarker = createClientMarker(nearestClientLatLng, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        } else {
            if (App.nearestClientMarker.getPosition().equals(nearestClientLatLng)) {
                return; // No actualizar si el cliente más cercano no ha cambiado
            }
            toggleMarkerIcon(App.nearestClientMarker, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
            App.nearestClientMarker.setPosition(nearestClientLatLng);
        }

        updatePathToNearestClient(deliveryLocation, nearestClientLatLng);
    } else {
        clearNearestClient();
    }

    restorePreviousClientIcon();
}

// Función para crear un marcador de cliente
function createClientMarker(position, iconUrl) {
    return new google.maps.Marker({
        position: position,
        map: App.map,
        icon: iconUrl
    });
}

// Función para alternar el icono de un marcador
function toggleMarkerIcon(marker, iconUrl) {
    if (marker.getIcon() !== iconUrl) {
        marker.setIcon(iconUrl);
    }
}

// Función para actualizar la ruta al cliente más cercano
function updatePathToNearestClient(deliveryLocation, nearestClientLocation) {
    if (App.pathToNearestClient) {
        App.pathToNearestClient.setMap(null);
    }

    App.pathToNearestClient = new google.maps.Polyline({
        path: [deliveryLocation, nearestClientLocation],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    App.pathToNearestClient.setMap(App.map);
}

// Función para limpiar el marcador y la ruta del cliente más cercano
function clearNearestClient() {
    if (App.nearestClientMarker) {
        App.nearestClientMarker.setMap(null);
        App.nearestClientMarker = null;
    }

    if (App.pathToNearestClient) {
        App.pathToNearestClient.setMap(null);
        App.pathToNearestClient = null;
    }
}

// Función para restaurar el icono del cliente anterior si no es el mismo que el actual
function restorePreviousClientIcon() {
    if (App.nearestClientMarker) {
        App.clientMarkers.forEach(marker => {
            if (marker !== App.nearestClientMarker && marker.getIcon() === 'http://maps.google.com/mapfiles/ms/icons/red-dot.png') {
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                marker.setVisible(true); // Asegurar que los otros clientes sean visibles
            }
        });
    }
}

// Función auxiliar para generar un número aleatorio en un rango específico
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
