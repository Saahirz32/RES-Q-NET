/**
 * RES-Q-NET - Instant Multi-Engine Map & Telemetry Visualizer
 */

window.ResqMapEngine = (function() {
    let map = null;
    let markersGroup = null;
    let hazardsGroup = null;
    let routesGroup = null;

    // Active Marker Cache for Zero-Flicker Instant Position Updates
    let robotMarkersMap = {};
    let survivorMarkersMap = {};
    let hazardLayersMap = {};

    let activeFilter = 'all';
    let currentTileLayer = null;
    let tileLayers = {};

    const defaultCenter = [28.6148, 77.2095];
    const defaultZoom = 15;

    function initMap(elementId) {
        const container = document.getElementById(elementId);
        if (!container) return;

        // Initialize Leaflet Map
        map = L.map(elementId, {
            zoomControl: false,
            attributionControl: false,
            fadeAnimation: false,
            zoomAnimation: true
        }).setView(defaultCenter, defaultZoom);

        // Zoom Control at Bottom Right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Multi-Tile Providers
        tileLayers = {
            dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd',
                attribution: 'CartoDB'
            }),
            osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: 'OpenStreetMap'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 18,
                attribution: 'Esri Satellite'
            })
        };

        // Default Tile Layer
        currentTileLayer = tileLayers.dark;
        currentTileLayer.addTo(map);

        // Fallback handler if CartoDB tile fails
        currentTileLayer.on('tileerror', function() {
            console.warn("Primary dark tiles slow/unreachable, switching to OpenStreetMap CDN...");
            if (map.hasLayer(tileLayers.dark)) {
                map.removeLayer(tileLayers.dark);
                tileLayers.osm.addTo(map);
                currentTileLayer = tileLayers.osm;
            }
        });

        // Initialize Layer Groups
        routesGroup = L.layerGroup().addTo(map);
        hazardsGroup = L.layerGroup().addTo(map);
        markersGroup = L.layerGroup().addTo(map);

        // Render Layers Initially
        renderStaticLayers();
        updateDynamicMarkers();

        // Admin map click handler
        map.on('click', function(e) {
            if (window.ResqApp && window.ResqApp.isLoggedIn() && window.ResqApp.isAddMarkerMode()) {
                window.ResqApp.handleMapClickAddMarker(e.latlng.lat, e.latlng.lng);
            }
        });

        // Immediate container resize calculation
        invalidateSize();

        console.log("RES-Q-NET Instant Map Engine Initialized");
    }

    /* Force Leaflet to recalculate container size instantly */
    function invalidateSize() {
        if (!map) return;
        map.invalidateSize(true);
    }

    function setTileProvider(providerKey) {
        if (!map || !tileLayers[providerKey]) return;

        Object.keys(tileLayers).forEach(key => {
            if (map.hasLayer(tileLayers[key])) {
                map.removeLayer(tileLayers[key]);
            }
        });

        currentTileLayer = tileLayers[providerKey];
        currentTileLayer.addTo(map);
        invalidateSize();
    }

    function renderStaticLayers() {
        if (!map || !window.RESQ_DATA) return;
        routesGroup.clearLayers();
        hazardsGroup.clearLayers();

        const data = window.RESQ_DATA;

        // 1. Render Safe Routes
        if (activeFilter === 'all' || activeFilter === 'routes') {
            data.safeRoutes.forEach(route => {
                const polyline = L.polyline(route.waypoints, {
                    color: '#22c55e',
                    weight: 5,
                    opacity: 0.85,
                    dashArray: '10, 8'
                }).addTo(routesGroup);

                polyline.bindPopup(`
                    <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
                        <h4 style="margin: 0 0 4px 0; color: #16a34a;">🟢 ${route.name}</h4>
                        <p style="margin: 0; font-size: 12px; color: #475569;"><strong>Status:</strong> ${route.status}</p>
                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${route.notes}</p>
                    </div>
                `);
            });
        }

        // 2. Render Hazards (Polygons & Pins)
        if (activeFilter === 'all' || activeFilter === 'hazards') {
            data.hazards.forEach(hazard => {
                let color = '#f97316';
                if (hazard.severity === 'Critical') color = '#ef4444';
                if (hazard.severity === 'Severe') color = '#ea580c';
                if (hazard.severity === 'Moderate') color = '#eab308';

                const circle = L.circle([hazard.lat, hazard.lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    radius: hazard.radius
                }).addTo(hazardsGroup);

                const hazardIcon = L.divIcon({
                    className: 'custom-hazard-pin',
                    html: `<div style="background: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 2px solid white; box-shadow: 0 0 10px ${color};">⚠️</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });

                const marker = L.marker([hazard.lat, hazard.lng], { icon: hazardIcon }).addTo(hazardsGroup);

                marker.bindPopup(`
                    <div style="color: #0f172a; font-family: sans-serif; min-width: 200px;">
                        <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">HAZARD: ${hazard.severity}</span>
                        <h4 style="margin: 6px 0 2px 0;">${hazard.title}</h4>
                        <p style="margin: 0; font-size: 12px; color: #475569;"><strong>Type:</strong> ${hazard.type}</p>
                        <p style="margin: 2px 0 6px 0; font-size: 11px; color: #64748b;">Detected by ${hazard.detectedBy}</p>
                        <div style="background: #f1f5f9; padding: 6px; border-radius: 4px; font-size: 11px; color: #334155; border-left: 3px solid ${color};">
                            <strong>SOP Action:</strong> ${hazard.actionSop}
                        </div>
                    </div>
                `);
            });
        }
    }

    /* Fast, Zero-Flicker Dynamic Marker Update Engine */
    function updateDynamicMarkers() {
        if (!map || !window.RESQ_DATA) return;
        const data = window.RESQ_DATA;

        // A. Update Survivors Markers
        if (activeFilter === 'all' || activeFilter === 'survivors') {
            data.survivors.forEach(surv => {
                let badgeColor = '#ef4444';
                let iconSymbol = '🆘';
                if (surv.status === 'Rescue In Progress') {
                    badgeColor = '#f97316';
                    iconSymbol = '⏳';
                } else if (surv.status === 'Rescued') {
                    badgeColor = '#22c55e';
                    iconSymbol = '✅';
                }

                if (survivorMarkersMap[surv.id]) {
                    // Smoothly update existing marker position
                    survivorMarkersMap[surv.id].setLatLng([surv.lat, surv.lng]);
                } else {
                    // Create new marker instance
                    const survIcon = L.divIcon({
                        className: 'custom-survivor-pin',
                        html: `
                            <div style="background: ${badgeColor}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 0 12px ${badgeColor}; animation: pulse 2s infinite;">
                                ${iconSymbol}
                            </div>
                        `,
                        iconSize: [34, 34],
                        iconAnchor: [17, 17]
                    });

                    const marker = L.marker([surv.lat, surv.lng], { icon: survIcon }).addTo(markersGroup);

                    marker.bindPopup(`
                        <div style="color: #0f172a; font-family: sans-serif; min-width: 230px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #0f172a;">${surv.id}</strong>
                                <span style="background: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">${surv.status}</span>
                            </div>
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #334155;"><strong>Confidence:</strong> ${surv.confidence}% (${surv.sensorType})</p>
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #334155;"><strong>Location:</strong> ${surv.locationDetail}</p>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 4px; margin-top: 6px; font-size: 11px;">
                                <div>❤️ Heart Rate: ${surv.vitals.heartRate}</div>
                                <div>🌡️ Thermal: ${surv.vitals.thermalTemp}</div>
                            </div>
                            <button onclick="window.ResqApp.openSurvivorActionModal('${surv.id}')" style="margin-top: 8px; width: 100%; background: #0284c7; color: white; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">
                                Update Rescue Status
                            </button>
                        </div>
                    `);

                    survivorMarkersMap[surv.id] = marker;
                }
            });
        }

        // B. Update Robot Swarm Markers
        if (activeFilter === 'all' || activeFilter === 'robots') {
            data.robots.forEach(bot => {
                let iconSymbol = bot.type.includes('Drone') ? '🚁' : (bot.type.includes('Snake') ? '🐍' : '🚜');
                let statusColor = bot.battery < 20 ? '#ef4444' : '#38bdf8';

                if (robotMarkersMap[bot.id]) {
                    // Instant position update
                    robotMarkersMap[bot.id].setLatLng([bot.lat, bot.lng]);
                } else {
                    const botIcon = L.divIcon({
                        className: 'custom-robot-pin',
                        html: `
                            <div style="background: #0f172a; color: ${statusColor}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid ${statusColor}; box-shadow: 0 0 10px ${statusColor};">
                                ${iconSymbol}
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    const marker = L.marker([bot.lat, bot.lng], { icon: botIcon }).addTo(markersGroup);

                    marker.bindPopup(`
                        <div style="color: #0f172a; font-family: sans-serif; min-width: 210px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0; color: #0284c7;">${bot.id} - ${bot.name}</h4>
                            </div>
                            <p style="margin: 4px 0; font-size: 12px; color: #475569;"><strong>Type:</strong> ${bot.type}</p>
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;"><strong>Task:</strong> ${bot.currentTask}</p>
                            <div style="margin-top: 6px; font-size: 11px; color: #334155;">
                                🔋 Battery: <strong>${bot.battery}%</strong> | 📶 Signal: <strong>${bot.signalRssi}</strong>
                            </div>
                        </div>
                    `);

                    robotMarkersMap[bot.id] = marker;
                }
            });
        }
    }

    function setFilter(filterType) {
        activeFilter = filterType;
        markersGroup.clearLayers();
        robotMarkersMap = {};
        survivorMarkersMap = {};
        renderStaticLayers();
        updateDynamicMarkers();
    }

    function focusLocation(lat, lng, zoom = 17) {
        if (!map) return;
        map.flyTo([lat, lng], zoom, { duration: 1.0 });
    }

    function refreshMap() {
        invalidateSize();
        updateDynamicMarkers();
    }

    return {
        initMap: initMap,
        invalidateSize: invalidateSize,
        setTileProvider: setTileProvider,
        setFilter: setFilter,
        focusLocation: focusLocation,
        refreshMap: refreshMap
    };
})();
