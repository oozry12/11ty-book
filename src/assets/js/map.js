import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Supercluster from "supercluster";
import geojsonExtent from "@mapbox/geojson-extent/geojson-extent";

// 定义 ControlButton 类
class ControlButton {
    // 构造函数接收一个参数对象
    constructor(options) {
        this._className = options.className || "";
        this._title = options.title || "";
    }

    // onAdd 方法，用于添加控件到地图
    onAdd(map) {
        // 创建按钮元素
        this._btn = document.createElement("button");
        this._btn.className = `mapboxgl-ctrl-icon ${this._className}`;
        this._btn.type = "button";
        this._btn.title = this._title;

        // 给按钮绑定点击事件，点击后地图飞到指定位置
        this._btn.onclick = () => {
            map.flyTo({ center: [108.14, 33.87], zoom: 3 });
        };

        // 创建控件容器
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";

        // 将按钮添加到控件容器中
        this._container.appendChild(this._btn);

        // 返回控件容器
        return this._container;
    }

    // onRemove 方法，用于从地图中移除控件
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

// 定义 CustomMap 类
class CustomMap {


    // 构造函数接收一个参数对象
    constructor(options = {}) {
        this.data = options.data;
        this.clusterData = [];
        this.markers = [];
        this.create();
    }

    // 创建地图并添加控件
    create() {
        mapboxgl.accessToken =
            "pk.eyJ1IjoicmVicm9uMTkwMCIsImEiOiJjbHZrYTkwNTAxdDZoMmxudmIwczV6Z2xhIn0.einiOpuQXz3bWmitKfcbEw";

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/light-v11",
            center: [108.14, 33.87],
            zoom: 3,
            minZoom: 3,
            maxZoom: 24,
            pitch: 0
        });

        const controlButton = new ControlButton({
            className: "mapbox-gl-draw_polygon",
            title: "返回",
        });

        map.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" }));
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
        map.addControl(controlButton, "top-right");

        map.on("load", () => {
            if (this.data) {
                this.cluster.load(this.data.features);
                this.clusterData = {
                    type: "FeatureCollection",
                    features: this.cluster.getClusters([-180, -90, 180, 90], 3),
                };
                this.updateMarkers();
                document.querySelector("#map").classList.add("is-loaded");
            }
        });

        map.on("zoom", () => {
            const zoomLevel = Math.floor(map.getZoom());
            this.clusterData = {
                type: "FeatureCollection",
                features: this.cluster.getClusters(
                    [-180, -90, 180, 90],
                    zoomLevel
                ),
            };
            this.updateMarkers();
        });


        // 添加点击事件监听器
        map.on('click', function (e) {
            // // 创建一个新的标记
            // new mapboxgl.Marker()
            // .setLngLat(e.lngLat)
            // .setPopup(new mapboxgl.Popup() // 创建一个弹出窗口
            //     .setHTML("<b>你的标记</b><br>经度：" + e.lngLat.lng + "<br>纬度：" + e.lngLat.lat))
            // .addTo(map);
        
            // // 收集标记数据
            // var markerData = {
            // longitude: e.lngLat.lng,
            // latitude: e.lngLat.lat,
            // // 其他数据...
            // };
        
            // // 发送数据到服务器
            // var xhr = new XMLHttpRequest();
            // xhr.open('POST', 'https://api.1900.live');
            // xhr.setRequestHeader('Content-Type', 'application/json');
            // xhr.onload = function() {
            // if (xhr.status === 200) {
            //     // 请求成功
            //     console.log('标记数据已发送到服务器');
            // }
            // };
            // xhr.send(JSON.stringify(markerData));
        });

        this.cluster = new Supercluster({
            radius: 26,
            maxZoom: 24,
        });

        this.map = map;
    }

    // 更新地图上的标记
    updateMarkers() {
        // 移除现有的标记
        this.markers.forEach((marker) => marker.remove());
        this.markers = [];

        // 添加新的标记或集群标记
        this.clusterData.features.forEach((feature) => {
            if (feature.properties.cluster) {
                this.addClusterMarker(feature);
            } else {
                this.addPhotoMarker(feature);
            }
        });
    }

    // 创建标记元素
    createMarker() {
        return document.createElement("div");
    }

    // 添加照片标记
    addPhotoMarker(feature) {
        const markerElement = this.createMarker();
        markerElement.className = "marker";
        markerElement.style.setProperty(
            "--photo",
            `url("${feature.properties.image}")`
        );

        let popupContent = `<h3>${feature.properties.title}</h3>`;
        if (feature.properties.permalink) {
            feature.properties.permalink.forEach((link, index) => {
                popupContent += `<p><a target="_blank" href="${link}">${feature.properties.description[index]}</a></p>`;
            });
        } else {
            markerElement.classList.add("no-post");
            popupContent += "<p>该地点暂无游记。</p>";
        }

        this.addMarkerToMap(
            markerElement,
            feature.geometry.coordinates,
            popupContent
        );
    }

    // 添加集群标记
    addClusterMarker(feature) {
        const markerElement = this.createMarker();
        markerElement.className = "marker cluster";
        markerElement.addEventListener("click", () => {
            this.clusterDidClick(markerElement, feature);
        });

        markerElement.dataset.cardinality = Math.min(
            9,
            feature.properties.point_count
        );
        this.addClusterToMap(markerElement, feature.geometry.coordinates);
    }

    // 将标记添加到地图
    addClusterToMap(markerElement, coordinates) {
        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .addTo(this.map);

        this.markers.push(marker);
    }

    // 将标记和弹出框添加到地图
    addMarkerToMap(markerElement, coordinates, popupContent) {
        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
            .addTo(this.map);

        this.markers.push(marker);
    }

    // 集群标记被点击时触发的事件
    clusterDidClick(markerElement, feature) {
        const clusterFeatures = this.cluster.getLeaves(
            feature.properties.cluster_id,
            Infinity
        );
        const boundingBox = geojsonExtent({
            type: "FeatureCollection",
            features: clusterFeatures,
        });

        this.map.fitBounds(boundingBox, {
            padding: 0.32 * this.map.getContainer().offsetHeight,
        });
    }
}

// var w = (function () {
//         function o(t) {
//             var e = t.className,
//                 n = void 0 === e ? "" : e,
//                 a = t.title,
//                 i = void 0 === a ? "" : a;
//             _classCallCheck(this, o), (this._className = n), (this._title = i);
//         }
//         return (
//             _createClass(o, [
//                 {
//                     key: "onAdd",
//                     value: function (t) {
//                         return (
//                             (this._btn = document.createElement("button")),
//                             (this._btn.className =
//                                 "mapboxgl-ctrl-icon " + this._className),
//                             (this._btn.type = "button"),
//                             (this._btn.title = this._title),
//                             (this._btn.onclick = function () {
//                                 t.flyTo({ center: [108.14, 33.87], zoom: 3 });
//                             }),
//                             (this._container = document.createElement("div")),
//                             (this._container.className =
//                                 "mapboxgl-ctrl-group mapboxgl-ctrl"),
//                             this._container.appendChild(this._btn),
//                             this._container
//                         );
//                     },
//                 },
//                 {
//                     key: "onRemove",
//                     value: function () {
//                         this._container.parentNode.removeChild(this._container),
//                             (this._map = void 0);
//                     },
//                 },
//             ]),
//             o
//         );
//     })()

//     k = (function () {
//         function e(t) {
//             _classCallCheck(this, e),
//                 (t = t || {}),
//                 (this.data = t.data),
//                 (this.clusterData = []),
//                 (this.markers = []),
//                 this._create();
//         }
//         return (
//             _createClass(e, [
//                 {
//                     key: "_create",
//                     value: function () {
//                         var n = this;
//                         mapboxgl.accessToken =
//                             "pk.eyJ1IjoicmVicm9uMTkwMCIsImEiOiJjbHZrYTkwNTAxdDZoMmxudmIwczV6Z2xhIn0.einiOpuQXz3bWmitKfcbEw";
//                         var t = new mapboxgl.Map({
//                                 container: "map",
//                                 style: "mapbox://styles/mapbox/light-v9",
//                                 center: [108.14, 33.87],
//                                 cluster: !0,
//                                 minZoom: 3,
//                                 maxZoom: 24,
//                                 zoom: 3,
//                             }),
//                             e = new w({
//                                 className: "mapbox-gl-draw_polygon",
//                                 title: "返回",
//                             });
//                         mapboxgl.setRTLTextPlugin(obvInit.launguagePACK),
//                             t.addControl(
//                                 new MapboxLanguage({ defaultLanguage: "zh" })
//                             ),
//                             t.addControl(
//                                 new mapboxgl.NavigationControl({
//                                     showCompass: !1,
//                                 })
//                             ),
//                             t.addControl(e, "top-right"),
//                             t.on("load", function (t) {
//                                 if (n.data)
//                                     return (
//                                         n.cluster.load(n.data.features),
//                                         (n.clusterData = {
//                                             type: "FeatureCollection",
//                                             features: n.cluster.getClusters(
//                                                 [-180, -90, 180, 90],
//                                                 3
//                                             ),
//                                         }),
//                                         n.updateMarkers(),
//                                         d("#map").classList.add("is-loaded")
//                                     );
//                             }),
//                             t.on("loaded", function (t) {}),
//                             t.on("zoom", function (t) {
//                                 var e = Math.floor(n.map.getZoom());
//                                 (n.clusterData = {
//                                     type: "FeatureCollection",
//                                     features: n.cluster.getClusters(
//                                         [-180, -90, 180, 90],
//                                         e
//                                     ),
//                                 }),
//                                     n.updateMarkers();
//                             }),
//                             (this.cluster = new Supercluster({
//                                 radius: 26,
//                                 maxZoom: 24,
//                             })),
//                             (this.map = t);
//                     },
//                 },
//                 {
//                     key: "updateMarkers",
//                     value: function () {
//                         this.markers.forEach(function (t) {
//                             return t.remove();
//                         });
//                         var t = !0,
//                             e = !(this.markers = []),
//                             n = void 0;
//                         try {
//                             for (
//                                 var a,
//                                     i =
//                                         this.clusterData.features[
//                                             Symbol.iterator
//                                         ]();
//                                 !(t = (a = i.next()).done);
//                                 t = !0
//                             ) {
//                                 var o = a.value;
//                                 o.properties.cluster
//                                     ? this.addClusterMarker(o)
//                                     : this.addPhotoMarker(o);
//                             }
//                         } catch (t) {
//                             (e = !0), (n = t);
//                         } finally {
//                             try {
//                                 t || null == i.return || i.return();
//                             } finally {
//                                 if (e) throw n;
//                             }
//                         }
//                     },
//                 },
//                 {
//                     key: "createMarker",
//                     value: function (t) {
//                         return document.createElement("div");
//                     },
//                 },
//                 {
//                     key: "addPhotoMarker",
//                     value: function (t) {
//                         var e = this.createMarker();
//                         (e.className = "marker"),
//                             e.style.setProperty(
//                                 "--photo",
//                                 'url("'.concat(t.properties.image, '"')
//                             );
//                         var n = "<h3>" + t.properties.title + "</h3>";
//                         if (t.properties.permalink)
//                             for (
//                                 var a = t.properties.permalink.length - 1;
//                                 0 <= a;
//                                 a--
//                             )
//                                 n +=
//                                     '<p><a target="_blank" href="' +
//                                     t.properties.permalink[a] +
//                                     '">' +
//                                     t.properties.description[a] +
//                                     "</a></p>";
//                         else
//                             e.classList.add("no-post"),
//                                 (n += "<p>该地点暂无游记。</p>");
//                         this.addMarkerToMap(e, t.geometry.coordinates, n);
//                     },
//                 },
//                 {
//                     key: "addClusterMarker",
//                     value: function (e) {
//                         var n = this,
//                             t =
//                                 (this.cluster.getLeaves(
//                                     e.properties.cluster_id
//                                 ),
//                                 this.createMarker());
//                         (t.className = "marker cluster"),
//                             t.addEventListener("click", function (t) {
//                                 return n.clusterDidClick(t, e);
//                             }),
//                             (t.dataset.cardinality = Math.min(
//                                 9,
//                                 e.properties.point_count
//                             )),
//                             this.addClusterToMap(t, e.geometry.coordinates);
//                     },
//                 },
//                 {
//                     key: "addClusterToMap",
//                     value: function (t, e) {
//                         var n = new mapboxgl.Marker(t)
//                             .setLngLat(e)
//                             .addTo(this.map);
//                         return this.markers.push(n), n;
//                     },
//                 },
//                 {
//                     key: "addMarkerToMap",
//                     value: function (t, e, n) {
//                         var a = new mapboxgl.Marker(t)
//                             .setLngLat(e)
//                             .setPopup(
//                                 new mapboxgl.Popup({ offset: 25 }).setHTML(
//                                     "" + n
//                                 )
//                             )
//                             .addTo(this.map);
//                         return this.markers.push(a), a;
//                     },
//                 },
//                 {
//                     key: "clusterDidClick",
//                     value: function (t, e) {
//                         var n = {
//                             type: "FeatureCollection",
//                             features: this.cluster.getLeaves(
//                                 e.properties.cluster_id
//                             ),
//                         };
//                         this.map.fitBounds(geojsonExtent(n), {
//                             padding:
//                                 0.32 * this.map.getContainer().offsetHeight,
//                         });
//                     },
//                 },
//             ]),
//             e
//         );
//     })();

export default function initMap() {
    if (null != document.querySelector("#map")) {
        fetch(
            "https://gist.githubusercontent.com/rebron1900/410a4f2e59c4abc8776849c1d6e9819b/raw/3a987dfb059a923d09ed1c4a1f64916495c1c26d/data.json"
        ).then(function (t) {
            return t.json().then(function (t) {
                new CustomMap({ data: t });
            });
        });
    }
}
