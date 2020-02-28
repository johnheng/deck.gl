/* global window */
import React, { Component } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9obmhlbmciLCJhIjoiY2s3NmJvc3puMHp1azNscXR5aDVhNWxlNCJ9.xg1A8qD5NUlGAHpKI_LmTA'; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json' // eslint-disable-line
};

var CLICK_DATA = [
  {
    "latitude": 40.7319,
    "longitude": -73.2202,
    "posting_id": "547532722",
    "context_id": "43a66b463c8e4ef8912b43ebb4f00cdb",
    "event_timestamp": 1582903812827
  },
  {
    "latitude": 38.8224,
    "longitude": -76.9466,
    "posting_id": "535093860",
    "context_id": "7370b74090d7404b9925ff6ceaf4da06",
    "event_timestamp": 1582903841678
  },
  {
    "latitude": 47.4514,
    "longitude": -122.3437,
    "posting_id": "53383678",
    "context_id": "c261748a91794981add3047b43b1f7f6",
    "event_timestamp": 1582903792376
  },
  {
    "latitude": 35.1312,
    "longitude": -84.0388,
    "posting_id": "45073849",
    "context_id": "dac538cca90b48b980c01ac9d2940ee5",
    "event_timestamp": 1582903847236
  },
  {
    "latitude": 28.0328443,
    "longitude": -80.7236259,
    "posting_id": "549935231",
    "context_id": "9bc45d7e-20eb-4bcc-a68a-074990eb4a72",
    "event_timestamp": 1582903848453
  },
  {
    "latitude": 32.67284,
    "longitude": -97.4711667,
    "posting_id": "549963367",
    "context_id": "6ea12cd5-0f1d-46db-a3d1-c3b54afa57b7",
    "event_timestamp": 1582903847292
  },
  {
    "latitude": 42.1316,
    "longitude": -80.0864,
    "posting_id": "74351258",
    "context_id": "8aac1a4566b64a6b831119876a35e778",
    "event_timestamp": 1582903847515
  },
  {
    "latitude": 40.1523,
    "longitude": -84.2502,
    "posting_id": "23990284",
    "context_id": "6ce8f963aebe47fcbb13419a34300163",
    "event_timestamp": 1582903847738
  },
  {
    "latitude": 40.0035,
    "longitude": -82.6726,
    "posting_id": "34957283",
    "context_id": "f07ca8623a464ab9a645425e7cb7ac83",
    "event_timestamp": 1582903849898
  },
  {
    "latitude": 36.1287,
    "longitude": -79.4086,
    "posting_id": "33299854",
    "context_id": "eb2b92d78a174bb380830689b29b1797",
    "event_timestamp": 1582903851258
  },
  {
    "latitude": 32.8685,
    "longitude": -97.2863,
    "posting_id": "535879955",
    "context_id": "5cf7be117a8b406d8c17c8062101af24",
    "event_timestamp": 1582903850690
  },
  {
    "latitude": 40.7033,
    "longitude": -73.8038,
    "posting_id": "34245761",
    "context_id": "dd29defdb8744ba5af3e1f85b11cb1f2",
    "event_timestamp": 1582903851876
  },
  {
    "latitude": 34.735927,
    "longitude": -92.297518,
    "posting_id": "551094856",
    "context_id": "FD0F015C-6242-4B07-B589-940673704FA4",
    "event_timestamp": 1582903853783
  },
  {
    "latitude": 32.1453,
    "longitude": -110.9456,
    "posting_id": "525539070",
    "context_id": "c3c1c7050e9a4e508a587d032cf5240c",
    "event_timestamp": 1582903854259
  },
  {
    "latitude": 39.981,
    "longitude": -75.1699,
    "posting_id": "74351625",
    "context_id": "533e32e36a484000822ad1180d3a3c1d",
    "event_timestamp": 1582903855618
  }
];

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  pitch: 45,
  bearing: 0
};

const landCover = [[[-74.0, 40.7], [-74.02, 40.7], [-74.02, 40.72], [-74.0, 40.72]]];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      loopLength = 1800, // unit corresponds to the timestamp in source data
      animationSpeed = 30 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _renderLayers() {
    var features = CLICK_DATA.map(cd => {
      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [cd.longitude, cd.latitude]
        },
        "properties": {
          "scalerank": 4,
          "natlscale": 8,
          "postingId": cd.posting_id,
          "timestamp": new Date(cd.event_timestamp)
        }
      }
    });

    var clickData = {
      type: "FeatureCollection",
      features: features
    }

    const {
      buildings = DATA_URL.BUILDINGS,
      trips = DATA_URL.TRIPS,
      trailLength = 180,
      theme = DEFAULT_THEME
    } = this.props;

    return [
      // This is only needed when using shadow effects
      new PolygonLayer({
        id: 'ground',
        data: landCover,
        getPolygon: f => f,
        stroked: false,
        getFillColor: [0, 0, 0, 0]
      }),
      new GeoJsonLayer({
        id: 'clicks',
        data: clickData,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getRadius: f => 1,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: this._onClick
      }),
      new PolygonLayer({
        id: 'buildings',
        data: buildings,
        extruded: true,
        wireframe: false,
        opacity: 0.5,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: theme.buildingColor,
        material: theme.material
      })
    ];
  }

  render() {
    const {
      viewState,
      mapStyle = 'mapbox://styles/mapbox/dark-v9',
      theme = DEFAULT_THEME
    } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={theme.effects}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
