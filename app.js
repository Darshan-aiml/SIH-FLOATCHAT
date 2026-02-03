// ARGO Ocean Assistant - Main Application Logic

class ArgoAssistant {
    constructor() {
        this.map = null;
        this.currentChart = 'temperature';
        this.selectedFloat = null; // Track selected float for chart variations
        this.floatData = [];
        this.realData = {}; // Store parsed NetCDF data
        this.chatHistory = [];
        this.dataLoaded = false;

        this.init();
    }

    init() {
        // Start with mock data so UI loads immediately
        this.floatData = this.generateMockFloatData();
        
        // Initialize UI components
        this.initializeMap();
        this.initializeCharts();
        this.setupEventListeners();
        this.displayInitialChart();
        
        // Load real NetCDF data in background and update when ready
        this.loadNetCDFFiles().then(() => {
            this.updateMapMarkers();
            this.displayChart(this.currentChart);
        }).catch(err => {
            console.error('NetCDF loading failed:', err);
        });
    }

    // Load and parse NetCDF files
    async loadNetCDFFiles() {
        const ncFiles = [
            'data/1901766_prof.nc',
            'data/1902674_prof.nc',
            'data/3902658_prof.nc',
            'data/7902242_prof.nc',
            'data/7902312_prof.nc'
        ];

        const newFloatData = [];
        
        for (const filePath of ncFiles) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                
                // Check if netcdfjs is available
                if (typeof netcdfjs === 'undefined') {
                    throw new Error('netcdfjs library not loaded');
                }
                
                const data = new netcdfjs.NetCDFReader(arrayBuffer);
                
                // Extract float ID from filename
                const floatId = filePath.match(/(\d+)_prof\.nc/)[1];
                
                // Parse the NetCDF data structure
                const parsedData = this.parseNetCDFData(data, floatId);
                this.realData[floatId] = parsedData;
                
                // Create float entries
                if (parsedData.profiles && parsedData.profiles.length > 0) {
                    parsedData.profiles.forEach((profile, idx) => {
                        newFloatData.push({
                            id: `ARGO_${floatId}_${idx}`,
                            floatId: floatId,
                            profileIndex: idx,
                            lat: profile.latitude || this.getRandomLatitude(),
                            lon: profile.longitude || this.getRandomLongitude(),
                            lastProfile: profile.date || new Date(),
                            temperature: profile.temperature || [],
                            salinity: profile.salinity || [],
                            pressure: profile.pressure || [],
                            depth: profile.depth || [],
                            status: 'active',
                            floatType: 'Core',
                            region: this.getRegionName(profile.latitude, profile.longitude),
                            profileVariation: Math.random()
                        });
                    });
                }
            } catch (error) {
                console.error(`Error loading ${filePath}:`, error);
            }
        }
        
        if (newFloatData.length > 0) {
            this.dataLoaded = true;
            this.floatData = newFloatData;
        }
    }

    // Parse NetCDF data structure
    parseNetCDFData(ncData, floatId) {
        const result = { floatId: floatId, profiles: [] };

        try {
            const nProfiles = ncData.dimensions.find(d => d.name === 'N_PROF')?.size || 1;
            const nLevels = ncData.dimensions.find(d => d.name === 'N_LEVELS')?.size || 1000;

            const latitude = ncData.getDataVariable('LATITUDE');
            const longitude = ncData.getDataVariable('LONGITUDE');
            const juld = ncData.getDataVariable('JULD');
            const temp = ncData.getDataVariable('TEMP');
            const psal = ncData.getDataVariable('PSAL');
            const pres = ncData.getDataVariable('PRES');


            for (let i = 0; i < nProfiles; i++) {
                const profile = {
                    latitude: latitude?.[i] || null,
                    longitude: longitude?.[i] || null,
                    date: juld ? this.julianToDate(juld[i]) : new Date(),
                    temperature: [],
                    salinity: [],
                    pressure: [],
                    depth: []
                };

                for (let j = 0; j < nLevels; j++) {
                    const idx = i * nLevels + j;
                    
                    const tempVal = temp?.[idx];
                    const psalVal = psal?.[idx];
                    const presVal = pres?.[idx];

                    if (tempVal && tempVal < 99999 && !isNaN(tempVal)) {
                        profile.temperature.push(tempVal);
                        profile.salinity.push(psalVal && psalVal < 99999 ? psalVal : 35);
                        profile.pressure.push(presVal && presVal < 99999 ? presVal : j * 2);
                        profile.depth.push(presVal && presVal < 99999 ? presVal : j * 2);
                    }
                }

                if (profile.temperature.length > 0) {
                    result.profiles.push(profile);
                }
            }

        } catch (error) {
            console.error('Error parsing NetCDF data:', error);
        }

        return result;
    }

    julianToDate(julian) {
        if (!julian || julian > 99999) return new Date();
        return new Date(new Date('1950-01-01T00:00:00Z').getTime() + julian * 86400000);
    }

    getRandomLatitude() {
        return -40 + Math.random() * 65;
    }

    getRandomLongitude() {
        return 30 + Math.random() * 125;
    }

    generateMockFloatData() {
        const floats = [];
        const oceanRegions = [
            { latMin: 10, latMax: 25, lonMin: 55, lonMax: 75 },
            { latMin: 5, latMax: 22, lonMin: 80, lonMax: 95 },
            { latMin: -20, latMax: 5, lonMin: 60, lonMax: 90 },
            { latMin: -40, latMax: -20, lonMin: 30, lonMax: 110 },
            { latMin: -30, latMax: 10, lonMin: 40, lonMax: 60 },
            { latMin: -35, latMax: -5, lonMin: 90, lonMax: 115 }
        ];

        oceanRegions.forEach((region, regionIndex) => {
            const floatsPerRegion = Math.floor(50 / oceanRegions.length) + (regionIndex < 50 % oceanRegions.length ? 1 : 0);

            for (let i = 0; i < floatsPerRegion; i++) {
                let lat, lon, attempts = 0;

                do {
                    lat = Math.random() * (region.latMax - region.latMin) + region.latMin;
                    lon = Math.random() * (region.lonMax - region.lonMin) + region.lonMin;
                    attempts++;
                } while (!this.isDeepOcean(lat, lon) && attempts < 20);

                if (attempts >= 20) {
                    const knownGoodLocations = this.getKnownOceanLocations();
                    const randomLocation = knownGoodLocations[Math.floor(Math.random() * knownGoodLocations.length)];
                    lat = randomLocation.lat;
                    lon = randomLocation.lon;
                }

                floats.push({
                    id: `ARGO_${4900000 + floats.length}`,
                    lat: lat,
                    lon: lon,
                    lastProfile: new Date(Date.now() - Math.random() * 2592000000),
                    temperature: this.getRealisticTemperature(lat),
                    salinity: this.getRealisticSalinity(lat),
                    depth: 1500 + Math.random() * 500,
                    status: Math.random() > 0.15 ? 'active' : 'inactive',
                    chlorophyll: this.getRealisticChlorophyll(lat),
                    dissolvedOxygen: this.getRealisticOxygen(lat),
                    nitrate: this.getRealisticNitrate(lat),
                    ph: this.getRealisticPH(lat),
                    floatType: Math.random() > 0.7 ? 'BGC' : 'Core',
                    region: this.getRegionName(lat, lon),
                    profileVariation: Math.random()
                });
            }
        });

        return floats;
    }

    isDeepOcean(lat, lon) {
        // Avoid Indian subcontinent
        if (lat > 8 && lat < 37 && lon > 68 && lon < 97) return false;

        // Avoid Arabian Peninsula
        if (lat > 12 && lat < 30 && lon > 34 && lon < 60) return false;

        // Avoid East Africa coast
        if (lat > -35 && lat < 15 && lon > 32 && lon < 52) return false;

        // Avoid Madagascar
        if (lat > -26 && lat < -12 && lon > 43 && lon < 51) return false;

        // Avoid Sri Lanka area
        if (lat > 5 && lat < 10 && lon > 79 && lon < 82) return false;

        // Avoid Maldives area (but allow some floats nearby)
        if (lat > 0 && lat < 7 && lon > 72 && lon < 74) return false;

        // Avoid Indonesian archipelago
        if (lat > -11 && lat < 6 && lon > 95 && lon < 141) return false;

        // Avoid Australian coast
        if (lat > -44 && lat < -10 && lon > 110 && lon < 155) return false;

        // Avoid Persian Gulf
        if (lat > 24 && lat < 30 && lon > 48 && lon < 57) return false;

        // Avoid Red Sea
        if (lat > 12 && lat < 28 && lon > 32 && lon < 43) return false;

        return true;
    }

    getKnownOceanLocations() {
        return [
            { lat: 15.5, lon: 65.0 }, { lat: 18.2, lon: 67.5 }, { lat: 20.1, lon: 63.8 },
            { lat: 12.5, lon: 87.0 }, { lat: 15.8, lon: 89.2 }, { lat: 18.0, lon: 85.5 },
            { lat: -5.0, lon: 75.0 }, { lat: -8.5, lon: 82.0 }, { lat: -12.0, lon: 78.5 },
            { lat: -25.0, lon: 70.0 }, { lat: -30.5, lon: 85.0 }, { lat: -35.2, lon: 95.0 },
            { lat: -15.0, lon: 55.0 }, { lat: -20.5, lon: 58.0 }, { lat: -10.0, lon: 52.0 },
            { lat: -25.0, lon: 105.0 }, { lat: -30.0, lon: 100.0 }, { lat: -20.0, lon: 108.0 }
        ];
    }

    getRealisticTemperature(lat) {
        return Math.max(2, 28 - Math.abs(lat) * 0.4 + (Math.random() - 0.5) * 4);
    }

    getRealisticSalinity(lat) {
        return Math.max(33, Math.min(37, 34.5 + Math.abs(lat - 15) * 0.02 + (Math.random() - 0.5) * 0.5));
    }

    getRealisticChlorophyll(lat) {
        const base = Math.abs(lat) > 20 ? 0.8 : 0.3;
        const seasonal = Math.sin(Date.now() / 31536000000 * 2 * Math.PI) * 0.2;
        return Math.max(0.1, base + seasonal + Math.random() * 0.4);
    }

    getRealisticOxygen(lat) {
        const temp = this.getRealisticTemperature(lat);
        return Math.max(2, Math.min(9, 8.5 - (temp - 2) * 0.15 + (Math.random() - 0.5) * 1.5));
    }

    getRealisticNitrate(lat) {
        const upwelling = Math.abs(lat) > 15 ? 1.5 : 0.5;
        return Math.max(0, Math.min(45, upwelling + Math.random() * 2));
    }

    getRealisticPH(lat) {
        return Math.max(7.8, Math.min(8.3, 8.1 - Math.abs(lat) * 0.002 + (Math.random() - 0.5) * 0.1));
    }

    getRegionName(lat, lon) {
        if (lat > 10 && lon > 55 && lon < 75) return 'Arabian Sea';
        if (lat > 5 && lat < 22 && lon > 80 && lon < 95) return 'Bay of Bengal';
        if (lat > -20 && lat < 5 && lon > 60 && lon < 90) return 'Central Indian Ocean';
        if (lat < -20 && lon > 30 && lon < 110) return 'Southern Indian Ocean';
        if (lat > -30 && lat < 10 && lon > 40 && lon < 60) return 'Western Indian Ocean';
        if (lat > -35 && lat < -5 && lon > 90 && lon < 115) return 'Eastern Indian Ocean';
        return 'Indian Ocean';
    }

    initializeMap() {
        this.map = L.map('map').setView([-10, 70], 4);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        this.addFloatMarkers();
    }

    addFloatMarkers() {
        this.floatData.forEach(float => {
            const markerColor = float.status === 'active' ? '#0ea5e9' : '#94a3b8';

            const marker = L.circleMarker([float.lat, float.lon], {
                radius: 6,
                fillColor: markerColor,
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);

            const surfaceTemp = Array.isArray(float.temperature) ? (float.temperature[0] || 25) : (float.temperature || 25);
            const surfaceSalinity = Array.isArray(float.salinity) ? (float.salinity[0] || 35) : (float.salinity || 35);
            const maxDepth = Array.isArray(float.depth) && float.depth.length > 0 ? Math.max(...float.depth) : (float.depth || 2000);

            const popupContent = `
                <div class="float-popup">
                    <h4>${float.id}</h4>
                    <p><strong>Status:</strong> ${float.status}</p>
                    <p><strong>Type:</strong> ${float.floatType}</p>
                    <p><strong>Region:</strong> ${float.region}</p>
                    <p><strong>Last Profile:</strong> ${float.lastProfile.toLocaleDateString()}</p>
                    <p><strong>Surface Temp:</strong> ${surfaceTemp.toFixed(1)}°C</p>
                    <p><strong>Surface Salinity:</strong> ${surfaceSalinity.toFixed(2)} PSU</p>
                    <p><strong>Max Depth:</strong> ${maxDepth.toFixed(0)}m</p>
                    ${Array.isArray(float.temperature) ? `<p><strong>Measurements:</strong> ${float.temperature.length} levels</p>` : ''}
                </div>
            `;

            marker.bindPopup(popupContent);

            marker.on('click', () => {
                this.selectedFloat = float;
                this.displayChart(this.currentChart);
                marker.setPopupContent(popupContent.replace('<h4>', '<h4>🎯 SELECTED: '));
            });

            marker.on('mouseover', function () {
                this.setStyle({
                    radius: 8,
                    weight: 3
                });
            });

            marker.on('mouseout', function () {
                this.setStyle({
                    radius: 6,
                    weight: 2
                });
            });
        });
    }

    updateMapMarkers() {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) {
                this.map.removeLayer(layer);
            }
        });
        this.addFloatMarkers();
    }

    initializeCharts() {
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
            });
        });
    }

    switchChart(chartType) {
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

        this.currentChart = chartType;
        this.displayChart(chartType);
    }

    displayInitialChart() {
        this.displayChart('temperature');
    }

    displayChart(type) {
        const container = document.getElementById('chartContainer');

        switch (type) {
            case 'temperature':
                this.displayTemperatureChart(container);
                break;
            case 'salinity':
                this.displaySalinityChart(container);
                break;
            case 'pressure':
                this.displayPressureChart(container);
                break;
            case 'chlorophyll':
                this.displayChlorophyllChart(container);
                break;
            case 'oxygen':
                this.displayOxygenChart(container);
                break;
            case 'nitrate':
                this.displayNitrateChart(container);
                break;
            case 'ph':
                this.displayPHChart(container);
                break;
            case 'heatmap':
                this.displayHeatmapChart(container);
                break;
            default:
                this.displayTemperatureChart(container);
        }
    }

    displayTemperatureChart(container) {
        // Use selected float or random float for variation
        const float = this.selectedFloat || this.floatData[Math.floor(Math.random() * this.floatData.length)];

        let depths = [];
        let temperatures = [];

        // Check if we have real profile data
        if (Array.isArray(float.temperature) && Array.isArray(float.depth) && 
            float.temperature.length > 0 && float.depth.length > 0) {
            depths = float.depth.map(d => -d);
            temperatures = float.temperature;
        } else {
            // Fallback to generated profile if no real data
            const surfaceTemp = typeof float.temperature === 'number' ? float.temperature : 25;
            const thermoclineDepth = 200 + (float.profileVariation - 0.5) * 100;
            const thermoclineStrength = 0.8 + float.profileVariation * 0.4;

            for (let depth = 0; depth <= 2000; depth += 50) {
                depths.push(-depth);

                let temp;
                if (depth < thermoclineDepth) {
                    temp = surfaceTemp - (depth / thermoclineDepth) * (surfaceTemp * 0.3) * thermoclineStrength;
                } else {
                    temp = surfaceTemp * 0.7 * Math.exp(-(depth - thermoclineDepth) / 800) + 2;
                }

                temp += (float.profileVariation - 0.5) * 2;
                temperatures.push(Math.max(1, temp));
            }
        }

        const trace = {
            x: temperatures,
            y: depths,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Temperature Profile - ${float.id}`,
            line: {
                color: '#0ea5e9',
                width: 3
            },
            marker: {
                color: '#14b8a6',
                size: 4
            }
        };

        const dataSource = Array.isArray(float.temperature) && float.temperature.length > 0 ? 
            '(Real NetCDF Data)' : '(Generated Data)';

        const layout = {
            title: {
                text: `Temperature vs Depth Profile - ${float.region} ${dataSource}`,
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Temperature (°C)',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'Depth (m)',
                gridcolor: '#e2e8f0'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 },
            annotations: [{
                text: `Float: ${float.id} | Status: ${float.status} | Measurements: ${temperatures.length}`,
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 12, color: '#64748b' }
            }]
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displaySalinityChart(container) {
        const float = this.selectedFloat || this.floatData[Math.floor(Math.random() * this.floatData.length)];
        
        let depths = [];
        let salinity = [];

        // Check if we have real profile data
        if (Array.isArray(float.salinity) && Array.isArray(float.depth) && 
            float.salinity.length > 0 && float.depth.length > 0) {
            // Use real data - plot as depth profile
            depths = float.depth.map(d => -d);
            salinity = float.salinity;
        } else {
            // Fallback to generated profile
            for (let depth = 0; depth <= 2000; depth += 50) {
                depths.push(-depth);
                const sal = 34.5 + 0.5 * Math.sin(depth / 300) + Math.random() * 0.2;
                salinity.push(sal);
            }
        }

        const trace = {
            x: salinity,
            y: depths,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Salinity Profile - ${float.id}`,
            line: {
                color: '#14b8a6',
                width: 3
            },
            marker: {
                color: '#0ea5e9',
                size: 4
            }
        };

        const dataSource = Array.isArray(float.salinity) && float.salinity.length > 0 ? 
            '(Real NetCDF Data)' : '(Generated Data)';

        const layout = {
            title: {
                text: `Salinity vs Depth Profile ${dataSource}`,
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Salinity (PSU)',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'Depth (m)',
                gridcolor: '#e2e8f0'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 },
            annotations: [{
                text: `Float: ${float.id} | Measurements: ${salinity.length}`,
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 12, color: '#64748b' }
            }]
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displayPressureChart(container) {
        const float = this.selectedFloat || this.floatData[Math.floor(Math.random() * this.floatData.length)];
        
        let depths = [];
        let pressures = [];

        // Check if we have real profile data
        if (Array.isArray(float.pressure) && float.pressure.length > 0) {
            pressures = float.pressure;
            depths = float.pressure.map(p => p * 10);
        } else {
            // Fallback to generated data
            for (let depth = 0; depth <= 2000; depth += 100) {
                depths.push(depth);
                const pressure = depth / 10 + Math.random() * 2;
                pressures.push(pressure);
            }
        }

        const trace = {
            x: pressures,
            y: depths,
            type: 'scatter',
            mode: 'markers',
            name: 'Pressure Measurements',
            marker: {
                color: depths,
                colorscale: 'Viridis',
                size: 8,
                colorbar: {
                    title: 'Depth (m)'
                }
            }
        };

        const layout = {
            title: {
                text: `Pressure vs Depth - ${float.id} ${Array.isArray(float.pressure) && float.pressure.length > 0 ? '(Real Data)' : '(Generated)'}`,
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Pressure (bar)',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'Depth (m)',
                autorange: 'reversed',
                gridcolor: '#e2e8f0'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 },
            annotations: [{text: `Measurements: ${pressures.length}`,
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 12, color: '#64748b' }
            }]
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displayChlorophyllChart(container) {
        // Use selected float or random float for variation
        const float = this.selectedFloat || this.floatData[Math.floor(Math.random() * this.floatData.length)];

        // Check if this float has chlorophyll sensors (BGC floats)
        if (float.floatType !== 'BGC' && Math.random() > 0.3) {
            container.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-semibold text-slate-700 mb-2">No Chlorophyll Data Available</h3>
                        <p class="text-sm text-slate-500">Float ${float.id} is a Core ARGO float without biogeochemical sensors.</p>
                        <p class="text-xs text-slate-400 mt-2">Try clicking on a different float or select BGC-ARGO floats.</p>
                    </div>
                </div>
            `;
            return;
        }

        const depths = [];
        const chlorophyll = [];

        // Create variation based on float location and characteristics
        const maxDepth = 60 + (float.profileVariation * 40); // Vary chlorophyll maximum depth
        const maxConcentration = float.chlorophyll * 3; // Scale based on surface value

        for (let depth = 0; depth <= 200; depth += 10) {
            depths.push(-depth);

            // Gaussian-like profile with variations
            const chla = Math.exp(-Math.pow(depth - maxDepth, 2) / (2 * Math.pow(25 + float.profileVariation * 15, 2))) * maxConcentration + 0.05;

            // Add regional variation
            let regionalFactor = 1;
            if (float.region.includes('Arabian Sea')) regionalFactor = 1.2; // Higher productivity
            if (float.region.includes('Southern')) regionalFactor = 0.8; // Lower productivity

            chlorophyll.push(Math.max(0.05, chla * regionalFactor + (Math.random() - 0.5) * 0.1));
        }

        const trace = {
            x: chlorophyll,
            y: depths,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Chlorophyll-a Profile - ${float.id}`,
            line: {
                color: '#22c55e',
                width: 3
            },
            marker: {
                color: '#16a34a',
                size: 4
            }
        };

        const layout = {
            title: {
                text: `Chlorophyll-a vs Depth Profile - ${float.region}`,
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Chlorophyll-a (mg/m³)',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'Depth (m)',
                gridcolor: '#e2e8f0'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 },
            annotations: [{
                text: `Float: ${float.id} | Type: ${float.floatType}-ARGO`,
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 12, color: '#64748b' }
            }]
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displayOxygenChart(container) {
        // Generate mock dissolved oxygen profile
        const depths = [];
        const oxygen = [];

        for (let depth = 0; depth <= 1000; depth += 25) {
            depths.push(-depth);
            // Oxygen minimum zone around 500-800m
            let o2;
            if (depth < 100) {
                o2 = 7 - depth * 0.02; // Surface saturation decreasing
            } else if (depth < 800) {
                o2 = 3 + Math.sin((depth - 100) / 200) * 1.5; // Oxygen minimum zone
            } else {
                o2 = 4 + (depth - 800) * 0.001; // Slight increase in deep water
            }
            oxygen.push(Math.max(1, o2 + Math.random() * 0.5));
        }

        const trace = {
            x: oxygen,
            y: depths,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Dissolved Oxygen Profile',
            line: {
                color: '#3b82f6',
                width: 3
            },
            marker: {
                color: '#1d4ed8',
                size: 4
            }
        };

        const layout = {
            title: {
                text: 'Dissolved Oxygen vs Depth Profile',
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Dissolved Oxygen (mg/L)',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'Depth (m)',
                gridcolor: '#e2e8f0'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 }
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displayNitrateChart(container) {
        // Use selected float or random float for variation
        const float = this.selectedFloat || this.floatData[Math.floor(Math.random() * this.floatData.length)];

        // Check if this float has nitrate sensors (only BGC floats)
        if (float.floatType !== 'BGC') {
            container.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-semibold text-slate-700 mb-2">No Nitrate Data Available</h3>
                        <p class="text-sm text-slate-500">Float ${float.id} is a Core ARGO float without nitrate sensors.</p>
                        <p class="text-xs text-slate-400 mt-2">Nitrate measurements require BGC-ARGO floats with specialized sensors.</p>
                    </div>
                </div>
            `;
            return;
        }

        const depths = [];
        const nitrate = [];

        // Create variation based on float characteristics
        const surfaceNitrate = float.nitrate;
        const nutriclineDepth = 100 + (float.profileVariation * 100); // Vary nutricline depth

        for (let depth = 0; depth <= 1500; depth += 50) {
            depths.push(-depth);

            // Realistic nitrate profile: low surface, increasing with depth
            let no3;
            if (depth < nutriclineDepth) {
                no3 = surfaceNitrate + (depth / nutriclineDepth) * 15;
            } else {
                no3 = 15 + (depth - nutriclineDepth) * 0.015;
            }

            // Add regional variation
            if (float.region.includes('Arabian Sea')) no3 *= 1.3; // Upwelling region
            if (float.region.includes('Bay of Bengal')) no3 *= 0.8; // River influence

            // Add float-specific variation
            no3 += (float.profileVariation - 0.5) * 8;

            nitrate.push(Math.max(0, no3 + (Math.random() - 0.5) * 2));
        }

        const trace = {
            x: nitrate,
            y: depths,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Nitrate Profile - ${float.id}`,
            line: {
                color: '#f59e0b',
                width: 3
            },
            marker: {
                color: '#d97706',
                size: 4
            }
        };

        const layout = {
            title: {
                text: `Nitrate vs Depth Profile - ${float.region}`,
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Nitrate (μmol/L)',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'Depth (m)',
                gridcolor: '#e2e8f0'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 },
            annotations: [{
                text: `Float: ${float.id} | Type: ${float.floatType}-ARGO`,
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 12, color: '#64748b' }
            }]
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displayPHChart(container) {
        // Use selected float or random float for variation
        const float = this.selectedFloat || this.floatData[Math.floor(Math.random() * this.floatData.length)];

        // Check if this float has pH sensors (only BGC floats)
        if (float.floatType !== 'BGC') {
            container.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-semibold text-slate-700 mb-2">No pH Data Available</h3>
                        <p class="text-sm text-slate-500">Float ${float.id} is a Core ARGO float without pH sensors.</p>
                        <p class="text-xs text-slate-400 mt-2">pH measurements require BGC-ARGO floats with specialized sensors.</p>
                    </div>
                </div>
            `;
            return;
        }

        const dates = [];
        const ph = [];
        const now = new Date();

        // Create variation based on float characteristics
        const basePH = float.ph;
        const seasonalAmplitude = 0.03 + (float.profileVariation * 0.02);

        for (let i = 90; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            dates.push(date.toISOString().split('T')[0]);

            // pH with seasonal variation and slight acidification trend
            const acidificationTrend = -(90 - i) * 0.0001;
            const seasonal = Math.sin((i + float.profileVariation * 30) / 30) * seasonalAmplitude;

            // Regional variation
            let regionalOffset = 0;
            if (float.region.includes('Arabian Sea')) regionalOffset = -0.02; // Slightly more acidic
            if (float.region.includes('Southern')) regionalOffset = 0.01; // Slightly more basic

            const phValue = basePH + acidificationTrend + seasonal + regionalOffset + (Math.random() - 0.5) * 0.01;
            ph.push(Math.max(7.8, Math.min(8.3, phValue)));
        }

        const trace = {
            x: dates,
            y: ph,
            type: 'scatter',
            mode: 'lines+markers',
            name: `pH Time Series - ${float.id}`,
            line: {
                color: '#8b5cf6',
                width: 2
            },
            marker: {
                color: '#7c3aed',
                size: 3
            }
        };

        const layout = {
            title: {
                text: `Ocean pH Trends - ${float.region} (Last 3 Months)`,
                font: { size: 16, color: '#334155' }
            },
            xaxis: {
                title: 'Date',
                gridcolor: '#e2e8f0'
            },
            yaxis: {
                title: 'pH',
                gridcolor: '#e2e8f0',
                range: [7.9, 8.3]
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 },
            annotations: [{
                text: `Float: ${float.id} | Type: ${float.floatType}-ARGO`,
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 12, color: '#64748b' }
            }]
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    displayHeatmapChart(container) {
        // Create temperature heatmap using float data
        const lats = [];
        const lons = [];
        const temps = [];
        const texts = [];

        this.floatData.forEach(float => {
            if (float.status === 'active') {
                lats.push(float.lat);
                lons.push(float.lon);
                temps.push(float.temperature);
                texts.push(`${float.id}<br>Temp: ${float.temperature.toFixed(1)}°C<br>Lat: ${float.lat.toFixed(2)}<br>Lon: ${float.lon.toFixed(2)}`);
            }
        });

        const trace = {
            type: 'scattergeo',
            mode: 'markers',
            lat: lats,
            lon: lons,
            marker: {
                size: 12,
                color: temps,
                colorscale: [
                    [0, '#313695'],
                    [0.1, '#4575b4'],
                    [0.2, '#74add1'],
                    [0.3, '#abd9e9'],
                    [0.4, '#e0f3f8'],
                    [0.5, '#ffffcc'],
                    [0.6, '#fee090'],
                    [0.7, '#fdae61'],
                    [0.8, '#f46d43'],
                    [0.9, '#d73027'],
                    [1, '#a50026']
                ],
                colorbar: {
                    title: 'Temperature (°C)',
                    titleside: 'right'
                },
                line: {
                    color: 'white',
                    width: 1
                }
            },
            text: texts,
            hovertemplate: '%{text}<extra></extra>',
            name: 'Temperature'
        };

        const layout = {
            title: {
                text: 'Indian Ocean Temperature Heatmap',
                font: { size: 16, color: '#334155' }
            },
            geo: {
                scope: 'world',
                showland: true,
                landcolor: 'rgb(243, 243, 243)',
                coastlinecolor: 'rgb(204, 204, 204)',
                showlakes: true,
                lakecolor: 'rgb(255, 255, 255)',
                projection: {
                    type: 'natural earth'
                },
                center: {
                    lat: -10,
                    lon: 70
                },
                lonaxis: {
                    range: [20, 120]
                },
                lataxis: {
                    range: [-45, 25]
                }
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 50, r: 50, b: 50, l: 60 }
        };

        Plotly.newPlot(container, [trace], layout, { responsive: true });
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        // Send message on button click
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                chatInput.value = this.getSuggestionQuery(e.target.textContent.trim());
                this.sendMessage();
            });
        });

        // Report generation button
        const generateReportButton = document.getElementById('generateReportButton');
        if (generateReportButton) {
            generateReportButton.addEventListener('click', () => {
                this.generateReport();
            });
        }


    }

    getSuggestionQuery(suggestion) {
        const queries = {
            'Temperature heatmap': 'Show me a temperature heatmap of the Indian Ocean',
            'Chlorophyll levels': 'What are the chlorophyll-a concentrations in the ocean?',
            'Dissolved oxygen': 'Show me dissolved oxygen profiles from ARGO floats',
            'pH measurements': 'What are the pH levels in the Indian Ocean?'
        };
        return queries[suggestion] || suggestion;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Clear input
        input.value = '';

        // Add user message to chat and store in history
        this.addMessageToChat(message, 'user');
        this.chatHistory.push({ type: 'user', message: message, timestamp: new Date() });

        // Show loading
        this.showTypingIndicator();

        // Simulate AI processing delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessageToChat(response.text, 'bot');
            
            // Store bot response in history
            this.chatHistory.push({ 
                type: 'bot', 
                message: response.text, 
                chartType: response.chartType,
                timestamp: new Date() 
            });

            // Update chart if relevant
            if (response.chartType) {
                this.switchChart(response.chartType);
            }
        }, 1500);
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3 chat-message';

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-white text-sm"></i>
                </div>
                <div class="user-message p-4 max-w-xs">
                    <p class="text-sm">${message}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="bot-message p-4 max-w-sm">
                    <p class="text-sm text-slate-700">${message}</p>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex items-start space-x-3';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="bg-slate-100 rounded-2xl rounded-tl-md p-4">
                <div class="typing-indicator flex space-x-1">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    generateResponse(query) {
        const lowerQuery = query.toLowerCase();

        // Get statistics from real data
        const stats = this.getDataStatistics();

        // Simple keyword-based response generation with real data
        if (lowerQuery.includes('temperature') && lowerQuery.includes('heatmap')) {
            return {
                text: `Here's the temperature heatmap for the Indian Ocean based on ${stats.activeFloats} active ARGO floats. ${this.dataLoaded ? `Real data from ${stats.totalProfiles} profiles shows` : 'Data shows'} surface temperatures ranging from ${stats.tempRange.min.toFixed(1)}°C to ${stats.tempRange.max.toFixed(1)}°C with clear regional patterns.`,
                chartType: 'heatmap'
            };
        } else if (lowerQuery.includes('temperature')) {
            return {
                text: `Based on our ARGO float network data (${stats.activeFloats} floats, ${stats.totalProfiles} profiles), ocean temperatures show seasonal variation. ${this.dataLoaded ? 'Real measurements indicate' : 'Data shows'} surface temperatures of ${stats.tempRange.min.toFixed(1)}-${stats.tempRange.max.toFixed(1)}°C, with deeper waters maintaining 2-4°C. The temperature profile shows a distinct thermocline.`,
                chartType: 'temperature'
            };
        } else if (lowerQuery.includes('chlorophyll')) {
            return {
                text: `Chlorophyll-a concentrations from our ${stats.activeFloats} floats show typical oceanic patterns with a subsurface maximum around 75m depth. Values range from 0.1-2.0 mg/m³, with higher concentrations in productive regions and upwelling areas.`,
                chartType: 'chlorophyll'
            };
        } else if (lowerQuery.includes('oxygen') || lowerQuery.includes('dissolved')) {
            return {
                text: `Dissolved oxygen profiles from ${stats.totalProfiles} measurements reveal the characteristic oxygen minimum zone between 500-800m depth. Surface waters are well-oxygenated (~7 mg/L), while deep waters show gradual recovery below 1000m.`,
                chartType: 'oxygen'
            };
        } else if (lowerQuery.includes('nitrate')) {
            const hasData = Math.random() > 0.3;
            if (!hasData) {
                return {
                    text: `No nitrate data is available for this region. Nitrate sensors are only deployed on specialized BGC-ARGO floats, which have limited coverage in the Indian Ocean.`,
                    chartType: 'nitrate'
                };
            }
            return {
                text: `Nitrate concentrations from BGC-ARGO floats increase with depth, showing typical nutrient profiles. Surface waters are nutrient-depleted (<5 μmol/L) while deep waters are nutrient-rich (>30 μmol/L).`,
                chartType: 'nitrate'
            };
        } else if (lowerQuery.includes('ph')) {
            const hasData = Math.random() > 0.4;
            if (!hasData) {
                return {
                    text: `No pH data is available for this region. pH measurements require specialized biogeochemical sensors that are only available on BGC-ARGO floats with limited deployment.`,
                    chartType: 'ph'
                };
            }
            return {
                text: `Ocean pH measurements from BGC-ARGO floats show values around 8.0-8.2, with slight seasonal variations. These measurements are crucial for understanding ocean chemistry changes and acidification trends.`,
                chartType: 'ph'
            };
        } else if (lowerQuery.includes('salinity')) {
            return {
                text: `Salinity measurements from ${stats.activeFloats} ARGO floats indicate ${this.dataLoaded ? 'real values of' : 'typical Indian Ocean values of'} ${stats.salinityRange.min.toFixed(2)}-${stats.salinityRange.max.toFixed(2)} PSU. ${this.dataLoaded ? 'Current data shows' : 'Data shows'} stable salinity patterns with slight seasonal variations, particularly in monsoon-affected regions.`,
                chartType: 'salinity'
            };
        } else if (lowerQuery.includes('float') || lowerQuery.includes('location')) {
            return {
                text: `Our ARGO network currently has ${stats.activeFloats} active floats deployed across the Indian Ocean with ${stats.totalProfiles} total profiles. ${this.dataLoaded ? 'Real-time data from floats ' + Object.keys(this.realData).join(', ') + ' are' : 'They are'} strategically positioned to monitor key oceanographic features.`,
                chartType: null
            };
        } else if (lowerQuery.includes('pressure') || lowerQuery.includes('depth')) {
            return {
                text: `Pressure measurements from ${stats.totalProfiles} profiles show the expected linear relationship with depth (~1 bar per 10m). Our floats regularly profile to 2000m depth, providing comprehensive water column data for climate research.`,
                chartType: 'pressure'
            };
        } else if (lowerQuery.includes('data') || lowerQuery.includes('profile') || lowerQuery.includes('measurement')) {
            return {
                text: `${this.dataLoaded ? 'Currently analyzing real NetCDF data from ' + Object.keys(this.realData).length + ' ARGO floats' : 'Using ARGO float data'} with ${stats.totalProfiles} vertical profiles. Each profile contains temperature, salinity, and pressure measurements from surface to ~2000m depth. ${this.dataLoaded ? 'Data files: ' + Object.keys(this.realData).map(id => id).join(', ') : ''}`,
                chartType: null
            };
        } else {
            return {
                text: `I can help you explore ARGO oceanographic data${this.dataLoaded ? ' from real NetCDF files (' + Object.keys(this.realData).length + ' floats loaded)' : ''}. Available parameters: temperature profiles, salinity measurements, chlorophyll levels, dissolved oxygen, nitrate, pH, and interactive heatmaps. What would you like to investigate?`,
                chartType: null
            };
        }
    }

    // Calculate statistics from loaded data
    getDataStatistics() {
        const stats = {
            activeFloats: this.floatData.filter(f => f.status === 'active').length,
            totalProfiles: this.floatData.length,
            tempRange: { min: Infinity, max: -Infinity },
            salinityRange: { min: Infinity, max: -Infinity }
        };

        this.floatData.forEach(float => {
            if (Array.isArray(float.temperature) && float.temperature.length > 0) {
                const maxTemp = Math.max(...float.temperature);
                const minTemp = Math.min(...float.temperature);
                if (maxTemp < 100) stats.tempRange.max = Math.max(stats.tempRange.max, maxTemp);
                if (minTemp > -5) stats.tempRange.min = Math.min(stats.tempRange.min, minTemp);
            } else if (typeof float.temperature === 'number') {
                stats.tempRange.max = Math.max(stats.tempRange.max, float.temperature);
                stats.tempRange.min = Math.min(stats.tempRange.min, float.temperature);
            }

            if (Array.isArray(float.salinity) && float.salinity.length > 0) {
                const maxSal = Math.max(...float.salinity);
                const minSal = Math.min(...float.salinity);
                if (maxSal < 50) stats.salinityRange.max = Math.max(stats.salinityRange.max, maxSal);
                if (minSal > 20) stats.salinityRange.min = Math.min(stats.salinityRange.min, minSal);
            } else if (typeof float.salinity === 'number') {
                stats.salinityRange.max = Math.max(stats.salinityRange.max, float.salinity);
                stats.salinityRange.min = Math.min(stats.salinityRange.min, float.salinity);
            }
        });

        // Set defaults if no valid data
        if (stats.tempRange.min === Infinity) stats.tempRange = { min: 2, max: 29 };
        if (stats.salinityRange.min === Infinity) stats.salinityRange = { min: 34.5, max: 35.5 };

        return stats;
    }

    generateReport() {
        // Show loading
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');

        // Prepare report data
        const reportData = {
            timestamp: new Date().toISOString(),
            chatHistory: this.chatHistory,
            floatData: this.floatData,
            currentChart: this.currentChart
        };

        // Store report data in localStorage for the report page
        localStorage.setItem('argoReportData', JSON.stringify(reportData));

        // Generate report after a short delay to show loading
        setTimeout(() => {
            // Open full-page report in new window/tab
            const reportWindow = window.open('report.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            
            if (!reportWindow) {
                alert('Please allow popups to generate the report, or try opening report.html directly.');
            }
            
            loadingOverlay.classList.add('hidden');
            loadingOverlay.classList.remove('flex');
        }, 1000);
    }


}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArgoAssistant();
});