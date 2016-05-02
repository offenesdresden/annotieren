import React from 'react'
import Reflux from 'reflux'

import Dialog from 'react-md/lib/Dialogs'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

export let actions = Reflux.createActions(['open', 'ok', 'cancel'])

const DEFAULT_LAT = 51.05455
const DEFAULT_LON = 13.74328


export default React.createClass({
  mixins: [
    Reflux.listenTo(actions.open, 'onOpen'),
    Reflux.listenTo(actions.ok, 'onOk'),
    Reflux.listenTo(actions.cancel, 'onCancel')
  ],

  getInitialState() {
    return {
      isOpen: false
    }
  },
  
  onOpen(lat, lon, text) {
    this.setState({
      lat: lat || DEFAULT_LAT,
      lon: lon || DEFAULT_LON,
      isOpen: true
    })

    if (!lat && !lon && text) {
      // Get suggestion from Nominatim
      fetch(`https://nominatim.openstreetmap.org/search?format=json&viewbox=13.5793237,51.1777202,13.9660626,50.974937&bounded=1&limit=1&namedetails=0&q=${encodeURIComponent(text)}`)
        .then(res => res.json())
        .then(res => {
          if (this.state.lat === DEFAULT_LAT &&
              this.state.lon === DEFAULT_LON &&
              res.length > 0) {
            // Marker wasn't moved while we queried
            this.setState({
              lat: res[0].lat,
              lon: res[0].lon
            })
          }
        })
    }
  },

  onOk() {
    this.setState({
      isOpen: false
    })
  },

  onCancel() {
    this.setState({
      isOpen: false
    })
  },

  onDragMarker() {
    let { lat, lng } = this.refs.marker.getLeafletElement().getLatLng()
    this.setState({
      lat,
      lon: lng
    })
  },
  
  render() {
    return (
      <Dialog isOpen={this.state.isOpen}
          title="Lokalisieren"
          model={true}
          close={() => actions.cancel()}
          actions={[{
            onClick: () => actions.ok(this.state.lat, this.state.lon),
            primary: true,
            label: "Ok"
          }, {
            onClick: () => actions.cancel(),
            secondary: true,
            label: "Abbrechen"
          }]}
          >

        <Map center={[DEFAULT_LAT, DEFAULT_LON]} zoom={11}
            style={{ width: "60vw", height: "50vh", margin: "2em auto" }}>
          <TileLayer
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
              attribution='<a href="http://osm.org/copyright">OSM</a>'
              />
          <Marker ref='marker'
              position={[this.state.lat, this.state.lon]}
              draggable={true} onDragend={this.onDragMarker}
              />
        </Map>
      </Dialog>
    )
  }
})
