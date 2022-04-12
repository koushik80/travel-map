import * as React from 'react';
import Map, { Marker, Popup, ScaleControl, Source, Layer } from 'react-map-gl';
import './app.css';
import { useEffect, useState } from 'react';
import { Room, Star } from "@material-ui/icons";
import moment from "moment";
import axios from 'axios';
import Register from "./components/Register";
import Login from "./components/Login";


function App() {
  const myStorage = window.localStorage;
  const [showPopup, setShowPopup] = React.useState(true);
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"))
  const [pins, setPins] = useState([]);
  const [newPlace, setNewPlace] = useState(null);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [star, setStar] = useState(0);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [viewState, setViewState] = React.useState({
    latitude: 60.3397,
    longitude: 25.1334,
    zoom: 3.5
  });

const geojson = {
  type: 'FeatureCollection',
  features: [
    {type: 'Feature', geometry: {type: 'Point', coordinates: [25.1334, 60.3397]}}
  ]
};

const layerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 10,
    'circle-color': '#cc2b5e'
  }
};

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewState({ ...viewState, latitude: lat, longitude: long });
  };
const handleAddClick = (e) => {
    const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lat: latitude,
      long: longitude,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("/pins");
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);
  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user");
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Map
      {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        transitionDuration="200"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        onDblClick={currentUsername && handleAddClick}
      >
        {pins.map((p) => (
          <>
            <Marker
              longitude={p.lat}
              latitude={p.long}
              anchor="left"
              offsetLeft={-3.5 * viewState.zoom}
              offsetTop={-7 * viewState.zoom}
            >
              <Room style={{
                fontSize: 7 * viewState.zoom,
                color: currentUsername === p.username ? "tomato" : "salmon",
                cursor: "pointer",
              }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && showPopup && (
              <Popup key={p._id} longitude={p.long} latitude={p.lat}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                 onClose={() => (setShowPopup(false) + setNewPlace(null))}>
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{moment(p.createdAt).format()}</span>
                </div>
              </Popup>
            )}
        </>
        ))}
        {newPlace && (
          <>
           <Marker
              latitude={newPlace.lat}
              longitude={newPlace.long}
              offsetLeft={-3.5 * viewState.zoom}
              offsetTop={-7 * viewState.zoom}
            >
              <Room
                style={{
                  fontSize: 7 * viewState.zoom,
                  color: "tomato",
                  cursor: "pointer",
                }}
              />
            </Marker>
            {showPopup && (
          <Popup
            longitude={newPlace.long}
            latitude={newPlace.lat}
            anchor="left"
            closeButton={true}
            closeOnClick={false}
             onClose={() => (setShowPopup(false) + setNewPlace(null))}>
            <div>
              <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                  placeholder="Enter a title"
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                />
                  <label>Review</label>
                  <label>Descrition</label>
                  <textarea
                   placeholder="Say us something about this place."
                   onChange={(e) => setDesc(e.target.value)}
                  />
                  <label>Rating</label>
                  <select onChange={(e) => setStar(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  </select>
                <button className="submitButton" type="submit">Add Pin</button>
              </form>
            </div>
            </Popup>)}
            </>
        )}
        {currentUsername ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUsername={setCurrentUsername}
            myStorage={myStorage}
          />
        )}
        <ScaleControl />
        <Source id="my-data" type="geojson" data={geojson}>
        <Layer {...layerStyle} />
      </Source>
      </Map>
    </div>
  );
}

export default App;
