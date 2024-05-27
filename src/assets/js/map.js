import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Supercluster from "supercluster";


export default function initMap() {
    if (null != document.querySelector("#map")) {
        fetch(
            "https://gist.githubusercontent.com/rebron1900/410a4f2e59c4abc8776849c1d6e9819b/raw/56300a4bb60db5040509e3b76c34ffd38ab0af08/data.json"
        ).then(function (t) {
            return t.json().then(function (t) {
                e({ data: t });
            });
        });
    }
}

function e(t) {
    (t = t || {}), (this.data = t.data);
    (this.clusterData = []), (this.markers = []);
    _create();
}

function o(t) {
    var e = t.className,
        n = void 0 === e ? "" : e,
        a = t.title,
        i = void 0 === a ? "" : a;
    _classCallCheck(this, o), (this._className = n), (this._title = i);
}

function _createClass(t, e, n) {
    return (
        e && _defineProperties(t.prototype, e), n && _defineProperties(t, n), t
    );
}

function _defineProperties(t, e) {
    for (var n = 0; n < e.length; n++) {
        var a = e[n];
        (a.enumerable = a.enumerable || !1),
            (a.configurable = !0),
            "value" in a && (a.writable = !0),
            Object.defineProperty(t, a.key, a);
    }
}

class HelloWorldControl {
    constructor(args) {
        this.args = args;
    }

    onAdd(button) {
        this._btn = document.createElement("button");
        this._btn.className =
            "mapboxgl-ctrl-icon " + args.className;
        this._btn.type = "button";
        this._btn.title = args.title;
        this._btn.onclick = function () {
            button.flyTo({ center: [108.14, 33.87], zoom: 3 });
        },
        this._container = document.createElement("div")
        this._container.className =
            "mapboxgl-ctrl-group mapboxgl-ctrl"
        this._container.appendChild(this._btn)
        this._container
        
        return this._container;
    }

    

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

function w() {
    return (
        _createClass(o, [
            {
                key: "onAdd",
                value: function (t) {
                    return (
                        (this._btn = document.createElement("button")),
                        (this._btn.className =
                            "mapboxgl-ctrl-icon " + this._className),
                        (this._btn.type = "button"),
                        (this._btn.title = this._title),
                        (this._btn.onclick = function () {
                            t.flyTo({ center: [108.14, 33.87], zoom: 3 });
                        }),
                        (this._container = document.createElement("div")),
                        (this._container.className =
                            "mapboxgl-ctrl-group mapboxgl-ctrl"),
                        this._container.appendChild(this._btn),
                        this._container
                    );
                },
            },
            {
                key: "onRemove",
                value: function () {
                    this._container.parentNode.removeChild(this._container),
                        (this._map = void 0);
                },
            },
        ]),
        o
    );
}

function _create() {
    var n = this;
    mapboxgl.accessToken =
        "pk.eyJ1IjoiZmF0ZXNpbmdlciIsImEiOiJjanc4bXFocG8wMXM1NDNxanB0MG5sa2ZpIn0.HqA5Q8Y4Jp1s3_TQ-sqVoQ";
    var t = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [108.14, 33.87],
        cluster: !0,
        minZoom: 3,
        maxZoom: 24,
        zoom: 3,
    });
    es = new HelloWorldControl({
        className: "mapbox-gl-draw_polygon",
        title: "返回",
    });
    mapboxgl.setRTLTextPlugin(
        "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.0/mapbox-gl-rtl-text.js"
    ),
        t.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" })),
        t.addControl(new mapboxgl.NavigationControl({ showCompass: !1 })),
        t.addControl(es, "top-right"),
        t.on("load", function (t) {
            if (n.data)
                return (
                    n.cluster.load(n.data.features),
                    (n.clusterData = {
                        type: "FeatureCollection",
                        features: n.cluster.getClusters(
                            [-180, -90, 180, 90],
                            3
                        ),
                    }),
                    updateMarkers(),
                    document.getElementById("map").classList.add("is-loaded")
                );
        }),
        t.on("loaded", function (t) {}),
        t.on("zoom", function (t) {
            var e = Math.floor(n.map.getZoom());
            (n.clusterData = {
                type: "FeatureCollection",
                features: n.cluster.getClusters([-180, -90, 180, 90], e),
            }),
                updateMarkers();
        }),
        (this.cluster = new Supercluster({
            radius: 26,
            maxZoom: 24,
        })),
        (this.map = t);
}
function updateMarkers() {
    this.markers.forEach(function (t) {
        return t.remove();
    });
    var t = !0,
        e = !(this.markers = []),
        n = void 0;
    try {
        for (
            var a, i = this.clusterData.features[Symbol.iterator]();
            !(t = (a = i.next()).done);
            t = !0
        ) {
            var o = a.value;
            o.properties.cluster ? addClusterMarker(o) : addPhotoMarker(o);
        }
    } catch (t) {
        (e = !0), (n = t);
    } finally {
        try {
            t || null == i.return || i.return();
        } finally {
            if (e) throw n;
        }
    }
}
function createMarker(t) {
    return document.createElement("div");
}
function addPhotoMarker(t) {
    var e = createMarker();
    (e.className = "marker"),
        e.style.setProperty("--photo", 'url("'.concat(t.properties.image, '"'));
    var n = "<h3>" + t.properties.title + "</h3>";
    if (t.properties.permalink)
        for (var a = t.properties.permalink.length - 1; 0 <= a; a--)
            n +=
                '<p><a target="_blank" href="' +
                t.properties.permalink[a] +
                '">' +
                t.properties.description[a] +
                "</a></p>";
    else e.classList.add("no-post"), (n += "<p>该地点暂无游记。</p>");
    addMarkerToMap(e, t.geometry.coordinates, n);
}
function addClusterMarker(e) {
    var n = this,
        t = (this.cluster.getLeaves(e.properties.cluster_id), createMarker());
    (t.className = "marker cluster"),
        t.addEventListener("click", function (t) {
            return clusterDidClick(t, e);
        }),
        (t.dataset.cardinality = Math.min(9, e.properties.point_count)),
        addClusterToMap(t, e.geometry.coordinates);
}
function addClusterToMap(t, e) {
    var n = new mapboxgl.Marker(t).setLngLat(e).addTo(this.map);
    return this.markers.push(n), n;
}
function addMarkerToMap(t, e, n) {
    var a = new mapboxgl.Marker(t)
        .setLngLat(e)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("" + n))
        .addTo(this.map);
    return this.markers.push(a), a;
}
function clusterDidClick(t, e) {
    var n = {
        type: "FeatureCollection",
        features: this.cluster.getLeaves(e.properties.cluster_id),
    };
    this.map.fitBounds(geojsonExtent(n), {
        padding: 0.32 * this.map.getContainer().offsetHeight,
    });
}

