var w = (function () {
        function o(t) {
            var e = t.className,
                n = void 0 === e ? "" : e,
                a = t.title,
                i = void 0 === a ? "" : a;
            _classCallCheck(this, o), (this._className = n), (this._title = i);
        }
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
    })(),
    k = (function () {
        function e(t) {
            _classCallCheck(this, e),
                (t = t || {}),
                (this.data = t.data),
                (this.clusterData = []),
                (this.markers = []),
                this._create();
        }
        return (
            _createClass(e, [
                {
                    key: "_create",
                    value: function () {
                        var n = this;
                        mapboxgl.accessToken =
                            "pk.eyJ1IjoiZmF0ZXNpbmdlciIsImEiOiJjanc4bXFocG8wMXM1NDNxanB0MG5sa2ZpIn0.HqA5Q8Y4Jp1s3_TQ-sqVoQ";
                        var t = new mapboxgl.Map({
                                container: "map",
                                style: "mapbox://styles/mapbox/light-v9",
                                center: [108.14, 33.87],
                                cluster: !0,
                                minZoom: 3,
                                maxZoom: 24,
                                zoom: 3,
                            }),
                            e = new w({
                                className: "mapbox-gl-draw_polygon",
                                title: "返回",
                            });
                        mapboxgl.setRTLTextPlugin(obvInit.launguagePACK),
                            t.addControl(
                                new MapboxLanguage({ defaultLanguage: "zh" })
                            ),
                            t.addControl(
                                new mapboxgl.NavigationControl({
                                    showCompass: !1,
                                })
                            ),
                            t.addControl(e, "top-right"),
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
                                        n.updateMarkers(),
                                        d("#map").classList.add("is-loaded")
                                    );
                            }),
                            t.on("loaded", function (t) {}),
                            t.on("zoom", function (t) {
                                var e = Math.floor(n.map.getZoom());
                                (n.clusterData = {
                                    type: "FeatureCollection",
                                    features: n.cluster.getClusters(
                                        [-180, -90, 180, 90],
                                        e
                                    ),
                                }),
                                    n.updateMarkers();
                            }),
                            (this.cluster = new Supercluster({
                                radius: 26,
                                maxZoom: 24,
                            })),
                            (this.map = t);
                    },
                },
                {
                    key: "updateMarkers",
                    value: function () {
                        this.markers.forEach(function (t) {
                            return t.remove();
                        });
                        var t = !0,
                            e = !(this.markers = []),
                            n = void 0;
                        try {
                            for (
                                var a,
                                    i =
                                        this.clusterData.features[
                                            Symbol.iterator
                                        ]();
                                !(t = (a = i.next()).done);
                                t = !0
                            ) {
                                var o = a.value;
                                o.properties.cluster
                                    ? this.addClusterMarker(o)
                                    : this.addPhotoMarker(o);
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
                    },
                },
                {
                    key: "createMarker",
                    value: function (t) {
                        return document.createElement("div");
                    },
                },
                {
                    key: "addPhotoMarker",
                    value: function (t) {
                        var e = this.createMarker();
                        (e.className = "marker"),
                            e.style.setProperty(
                                "--photo",
                                'url("'.concat(t.properties.image, '"')
                            );
                        var n = "<h3>" + t.properties.title + "</h3>";
                        if (t.properties.permalink)
                            for (
                                var a = t.properties.permalink.length - 1;
                                0 <= a;
                                a--
                            )
                                n +=
                                    '<p><a target="_blank" href="' +
                                    t.properties.permalink[a] +
                                    '">' +
                                    t.properties.description[a] +
                                    "</a></p>";
                        else
                            e.classList.add("no-post"),
                                (n += "<p>该地点暂无游记。</p>");
                        this.addMarkerToMap(e, t.geometry.coordinates, n);
                    },
                },
                {
                    key: "addClusterMarker",
                    value: function (e) {
                        var n = this,
                            t =
                                (this.cluster.getLeaves(
                                    e.properties.cluster_id
                                ),
                                this.createMarker());
                        (t.className = "marker cluster"),
                            t.addEventListener("click", function (t) {
                                return n.clusterDidClick(t, e);
                            }),
                            (t.dataset.cardinality = Math.min(
                                9,
                                e.properties.point_count
                            )),
                            this.addClusterToMap(t, e.geometry.coordinates);
                    },
                },
                {
                    key: "addClusterToMap",
                    value: function (t, e) {
                        var n = new mapboxgl.Marker(t)
                            .setLngLat(e)
                            .addTo(this.map);
                        return this.markers.push(n), n;
                    },
                },
                {
                    key: "addMarkerToMap",
                    value: function (t, e, n) {
                        var a = new mapboxgl.Marker(t)
                            .setLngLat(e)
                            .setPopup(
                                new mapboxgl.Popup({ offset: 25 }).setHTML(
                                    "" + n
                                )
                            )
                            .addTo(this.map);
                        return this.markers.push(a), a;
                    },
                },
                {
                    key: "clusterDidClick",
                    value: function (t, e) {
                        var n = {
                            type: "FeatureCollection",
                            features: this.cluster.getLeaves(
                                e.properties.cluster_id
                            ),
                        };
                        this.map.fitBounds(geojsonExtent(n), {
                            padding:
                                0.32 * this.map.getContainer().offsetHeight,
                        });
                    },
                },
            ]),
            e
        );
    })();
if (null != document.querySelector("#map")) {
    fetch("https://fatesinger.com/__api/v1/geojson").then(function (t) {
        return t.json().then(function (t) {
            new k({ data: t });
        });
    });
}
