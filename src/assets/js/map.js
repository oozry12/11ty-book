import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Supercluster from "supercluster";
import geojsonExtent from "@mapbox/geojson-extent/geojson-extent";
import tippy from "tippy.js";
import search from "./search";



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


class MapHandler {
    constructor(options) {
        options = options || {};
        this.data = options.data;
        this.clusterData = [];
        this.markers = [];
        this.tippy = [];
        this._create();
    }

    _create() {
        const self = this;
        mapboxgl.accessToken = "pk.eyJ1IjoiZmF0ZXNpbmdlciIsImEiOiJjanc4bXFocG8wMXM1NDNxanB0MG5sa2ZpIn0.HqA5Q8Y4Jp1s3_TQ-sqVoQ";

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/"+ localStorage.themetype +"-v10",
            center: [108.14, 33.87],
            cluster: true,
            minZoom: 3,
            maxZoom: 24,
            zoom: 3,
        });

        const controlButton = new ControlButton({
            className: "mapbox-gl-draw_polygon",
            title: "返回",
        });

        map.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" }));
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
        map.addControl(controlButton, "top-right");

        map.on("load", function () {
            if (self.data) {
                self.cluster.load(self.data.features);
                self.clusterData = {
                    type: "FeatureCollection",
                    features: self.cluster.getClusters([-180, -90, 180, 90], 3),
                };
                self.updateMarkers();
                document.querySelector("#map").classList.add("is-loaded");
            }
        });

        map.on("zoom", function () {
            const zoomLevel = Math.floor(self.map.getZoom());
            self.clusterData = {
                type: "FeatureCollection",
                features: self.cluster.getClusters([-180, -90, 180, 90], zoomLevel),
            };
            self.updateMarkers();
        });

        this.cluster = new Supercluster({
            radius: 26,
            maxZoom: 24,
        });
        this.map = map;
    }

    updateMarkers() {
        this.markers.forEach(function (marker) {
            return marker.remove();
        });
        this.tippy = [];
        this.markers = [];

        const iterator = this.clusterData.features[Symbol.iterator]();
        let result;

        try {
            while (!(result = iterator.next()).done) {
                const feature = result.value;
                if (feature.properties.cluster) {
                    this.addClusterMarker(feature);
                } else {
                    this.addPhotoMarker(feature);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    createMarker() {
        return document.createElement("div");
    }

    addPhotoMarker(feature) {
        const markerElement = this.createMarker();
        markerElement.className = "marker";

        if(feature.properties.description){
            //console.log(feature.properties.description)
        }

        markerElement.style.setProperty("--photo", 'url("' + feature.properties.image + '"');

        let popupContent = `<strong>${feature.properties.name}</strong><br />`;
        if (feature.properties.permalink) {
            feature.properties.permalink.forEach((link, index) => {
                popupContent += `<a style='color:var(--hint-color-info)' target="_blank" href="${link}">${feature.properties.description[index]}</a>`;
            });
        } else {
            markerElement.classList.add("no-post");
            popupContent += "该地点暂无游记。";
        }

        this.tippy.push(tippy(markerElement, {
            allowHTML: true,
            placement: "top",
            maxWidth: 300,
            delay: 150,
            interactive: true,
            content: popupContent
        }))

        this.addMarkerToMap(markerElement, feature.geometry.coordinates, popupContent);
    }

    addClusterMarker(feature) {
        const clusterMarker = this.createMarker();
        clusterMarker.className = "marker cluster";

        clusterMarker.addEventListener("click", (event) => {
            this.clusterDidClick(event, feature);
        });

        clusterMarker.dataset.cardinality = Math.min(9, feature.properties.point_count);

            // 获取聚合标记中包含的所有标记的名称
        const leaves = this.cluster.getLeaves(feature.properties.cluster_id);
        const names = `<strong>包含了 ${clusterMarker.dataset.cardinality} 个地点</strong><br />` + leaves.map(leaf => leaf.properties.name).join(", ");

        // 创建 Tippy.js 实例，显示聚合标记的名称
        this.tippy.push(tippy(clusterMarker, {
            content: names || "无标记",
            allowHTML: true,
            placement: "top",
            maxWidth: 300,
            delay: 150,
            interactive: true,
        }));


        this.addClusterToMap(clusterMarker, feature.geometry.coordinates);
    }

    addClusterToMap(markerElement, coordinates) {
        const marker = new mapboxgl.Marker(markerElement).setLngLat(coordinates).addTo(this.map);
        this.markers.push(marker);
        return marker;
    }

    addMarkerToMap(markerElement, coordinates, popupContent) {
        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .addTo(this.map);
        this.markers.push(marker);
        return marker;
    }

    clusterDidClick(event, feature) {
        const leaves = {
            type: "FeatureCollection",
            features: this.cluster.getLeaves(feature.properties.cluster_id),
        };
        this.map.fitBounds(geojsonExtent(leaves), {
            padding: 0.32 * this.map.getContainer().offsetHeight,
        });
    }
}

export default function initMap() {
    if (null != document.querySelector("#map")) {
        fetch(
            "https://ghproxy.net/https://raw.githubusercontent.com/rebron1900/doumark-action/master/data/geojson.json?short_path=832ba66"
        ).then(function (t) {
            return t.json().then(function (t) {
                window.mapboxi = new MapHandler({ data: t });
            });
        });
    }   
}
