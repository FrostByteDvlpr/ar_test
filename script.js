
// getting places from APIs
function loadPlaces(position) {
    const params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'POUBHRAF4CKQMIGNSBGESC3ULZ3GRO5NA5EJ4DYQUWDOT3PF',
        clientSecret: 'ZUGE1RXCBJIKYQKKWJK2EJINW5GOGUP1C1WZ0D4XLELMASI1',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API (limit param: number of maximum places to fetch)
    const endpoint = `https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=30 
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};


window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {

        // than use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => {
                places.forEach((place) => {
                    console.log(place)
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;

                    // add place name
                    const placeText = document.createElement('a-link');
                    placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    placeText.setAttribute('title', place.name);
                    placeText.setAttribute('scale', '15 15 15');
                    placeText.setAttribute('class', 'placeText');
                    
                    placeText.addEventListener('loaded', () => {
                        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    });

                    let isClicked = false;
                    document.querySelectorAll('.placeText').forEach((text) => {
                        text.style.fontSize = '5em';
                        text.style.textShadow = '0px 1px 3px rgba(0,0,0,.25)';
                        text.addEventListener('click', (text) => {
                            isClicked = !isClicked;
                            if(isClicked) {
                                text.removeAttribute('scale');
                                text.setAttribute('scale', '25 25 25');
                            } else {
                                text.removeAttribute('scale');
                                placeText.setAttribute('scale', '15 15 15');
                            }
                        });
                        text.addEventListener('touchstart', (text) => {
                            isClicked = !isClicked;
                            if(isClicked) {
                                text.removeAttribute('scale');
                                text.setAttribute('scale', '25 25 25');
                            } else {
                                text.removeAttribute('scale');
                                placeText.setAttribute('scale', '15 15 15');
                            }
                        });
                    });

                    scene.appendChild(placeText);
                });
            })
    },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};
