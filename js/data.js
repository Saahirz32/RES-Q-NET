/**
 * RES-Q-NET - Initial Operational Seed Data
 * Scenario: Operation Swarm Response - Delhi-NCR Earthquake Disaster Zone (Magnitude 7.1)
 */

window.RESQ_DATA = {
    incident: {
        id: "INC-2026-EQ-DELHI04",
        name: "Operation Shield Swarm - Sector 4 & 5",
        location: "National Capital Region, India",
        epicenter: "28.6139 N, 77.2090 E",
        magnitude: "7.1 Richter Scale",
        startTime: "2026-08-23T18:30:00Z",
        meshStatus: "ONLINE (100% Swarm Coverage)",
        activeUnits: 8,
        totalSurvivors: 6,
        rescuedCount: 2,
        activeHazards: 4
    },

    survivors: [
        {
            id: "SURV-101",
            name: "Survivor #101 (Signal Detected)",
            lat: 28.6152,
            lng: 77.2085,
            confidence: 96,
            sensorType: "FLIR Thermal Array + UWB Radar",
            detectedBy: "SQ-03 Rover",
            time: "10 mins ago",
            timestamp: "2026-08-23T22:33:00+05:30",
            locationDetail: "Trapped under collapsed concrete beam, Basement B1",
            priority: "P1-Immediate",
            status: "Detected", // Detected, Rescue In Progress, Rescued
            vitals: {
                heartRate: "108 bpm (Doppler)",
                thermalTemp: "36.9°C",
                respiration: "19 bpm",
                audioSignal: "Intermittent tapping sound detected"
            },
            notes: "Requires hydraulic spreader for beam lifting. Oxygen level in cavity: 19.5%."
        },
        {
            id: "SURV-102",
            name: "Survivor #102 (Signal Detected)",
            lat: 28.6125,
            lng: 77.2110,
            confidence: 89,
            sensorType: "Acoustic Micro-Array (Audio Ping)",
            detectedBy: "SQ-01 Drone",
            time: "18 mins ago",
            timestamp: "2026-08-23T22:25:00+05:30",
            locationDetail: "Stairwell shaft rubble, 2nd Floor overhang",
            priority: "P1-Immediate",
            status: "Rescue In Progress",
            vitals: {
                heartRate: "115 bpm",
                thermalTemp: "37.1°C",
                respiration: "22 bpm",
                audioSignal: "Vocal distress call localized"
            },
            notes: "NDRF Team Bravo dispatched. Stabilizing upper overhang."
        },
        {
            id: "SURV-103",
            name: "Survivor #103 (Signal Detected)",
            lat: 28.6165,
            lng: 77.2062,
            confidence: 94,
            sensorType: "UWB Ground Penetrating Radar",
            detectedBy: "SQ-05 Snake Probe",
            time: "32 mins ago",
            timestamp: "2026-08-23T22:11:00+05:30",
            locationDetail: "Void under collapsed brick archway",
            priority: "P2-Delayed",
            status: "Detected",
            vitals: {
                heartRate: "82 bpm",
                thermalTemp: "36.5°C",
                respiration: "16 bpm",
                audioSignal: "Faint breathing motion on radar"
            },
            notes: "Structure stable. Secondary priority after SURV-101."
        },
        {
            id: "SURV-104",
            name: "Survivor #104 (Extricated)",
            lat: 28.6110,
            lng: 77.2075,
            confidence: 98,
            sensorType: "Visual & Thermal Fusion",
            detectedBy: "SQ-02 Drone",
            time: "55 mins ago",
            timestamp: "2026-08-23T21:48:00+05:30",
            locationDetail: "Sub-level parking entrance",
            priority: "P3-Minor",
            status: "Rescued",
            vitals: {
                heartRate: "76 bpm",
                thermalTemp: "36.6°C",
                respiration: "15 bpm",
                audioSignal: "Conscious and responsive"
            },
            notes: "Transferred to AIIMS Mobile Field Hospital at 22:15."
        },
        {
            id: "SURV-105",
            name: "Survivor #105 (Signal Detected)",
            lat: 28.6142,
            lng: 77.2135,
            confidence: 91,
            sensorType: "Thermal FLIR + Carbon Dioxide Sensor",
            detectedBy: "SQ-04 Rover",
            time: "1 hr 10 mins ago",
            timestamp: "2026-08-23T21:33:00+05:30",
            locationDetail: "Under wooden furniture debris in residential block",
            priority: "P2-Delayed",
            status: "Rescue In Progress",
            vitals: {
                heartRate: "90 bpm",
                thermalTemp: "36.8°C",
                respiration: "17 bpm",
                audioSignal: "Movement detected"
            },
            notes: "SDRF Unit 3 cutting clearance path."
        },
        {
            id: "SURV-106",
            name: "Survivor #106 (Extricated)",
            lat: 28.6178,
            lng: 77.2098,
            confidence: 99,
            sensorType: "Acoustic + Visual Cam",
            detectedBy: "SQ-06 Rover",
            time: "2 hrs ago",
            timestamp: "2026-08-23T20:43:00+05:30",
            locationDetail: "Commercial Complex Courtyard",
            priority: "P1-Immediate",
            status: "Rescued",
            vitals: {
                heartRate: "88 bpm",
                thermalTemp: "36.7°C",
                respiration: "16 bpm",
                audioSignal: "Rescued successfully"
            },
            notes: "Evacuated via Air Ambulance. Stable."
        }
    ],

    robots: [
        {
            id: "SQ-01",
            name: "Vanguard Aerial Scout-1",
            type: "Aerial Recon Drone",
            status: "Active Scanning", // Active Scanning, Navigating, Low Battery, Mesh Relay
            battery: 88,
            signalRssi: "-42 dBm (Excellent)",
            lat: 28.6148,
            lng: 77.2095,
            altitude: "18 m",
            sensors: ["4K Optical", "FLIR Lepton 3.5", "Acoustic Array"],
            currentTask: "Mapping Sector 4 North Boundary & Gas Plumes",
            lastPing: "Just now"
        },
        {
            id: "SQ-02",
            name: "Falcon High-Altitude Mesh-2",
            type: "Aerial Relay Drone",
            status: "Mesh Relay",
            battery: 74,
            signalRssi: "-48 dBm (Strong)",
            lat: 28.6160,
            lng: 77.2115,
            altitude: "35 m",
            sensors: ["RF Mesh Switch", "HD Thermal Camera"],
            currentTask: "Maintaining Sub-10ms Swarm Mesh Link to Base",
            lastPing: "2 sec ago"
        },
        {
            id: "SQ-03",
            name: "Ground Crawler Titan-1",
            type: "Ground Crawler Rover",
            status: "Active Scanning",
            battery: 92,
            signalRssi: "-38 dBm (Excellent)",
            lat: 28.6150,
            lng: 77.2082,
            altitude: "Ground Level",
            sensors: ["UWB Radar", "CO2 Gas Sensor", "Thermal Imager"],
            currentTask: "Inspecting Collapse Void around SURV-101",
            lastPing: "1 sec ago"
        },
        {
            id: "SQ-04",
            name: "Ground Crawler Titan-2",
            type: "Ground Crawler Rover",
            status: "Active Scanning",
            battery: 65,
            signalRssi: "-55 dBm (Good)",
            lat: 28.6140,
            lng: 77.2130,
            altitude: "Ground Level",
            sensors: ["LIDAR 3D Scanner", "Hazard Gas Array"],
            currentTask: "Scanning Residential Sector 5 Rubble",
            lastPing: "3 sec ago"
        },
        {
            id: "SQ-05",
            name: "Viper Snake Probe-1",
            type: "Snake Recon Probe",
            status: "Active Scanning",
            battery: 81,
            signalRssi: "-62 dBm (Moderate)",
            lat: 28.6163,
            lng: 77.2064,
            altitude: "Sub-surface -2m",
            sensors: ["Endoscopic Micro-Cam", "Microphone Array"],
            currentTask: "Deep void penetration under Archway",
            lastPing: "Just now"
        },
        {
            id: "SQ-06",
            name: "Heavy Pack Mule Rover-3",
            type: "Heavy Ground Rover",
            status: "Navigating",
            battery: 48,
            signalRssi: "-50 dBm (Strong)",
            lat: 28.6175,
            lng: 77.2100,
            altitude: "Ground Level",
            sensors: ["Structural Deflection Radar", "Cargo Payload Bay"],
            currentTask: "Transporting Emergency Respirators to SDRF",
            lastPing: "5 sec ago"
        },
        {
            id: "SQ-07",
            name: "Vanguard Aerial Scout-2",
            type: "Aerial Recon Drone",
            status: "Low Battery - Returning",
            battery: 15,
            signalRssi: "-68 dBm (Fair)",
            lat: 28.6120,
            lng: 77.2060,
            altitude: "12 m",
            sensors: ["FLIR Thermal", "RGB High Resolution"],
            currentTask: "Auto-returning to Swarm Charging Dock Alpha",
            lastPing: "Just now"
        },
        {
            id: "SQ-08",
            name: "Ground Crawler Titan-4",
            type: "Ground Crawler Rover",
            status: "Mesh Relay",
            battery: 95,
            signalRssi: "-35 dBm (Excellent)",
            lat: 28.6130,
            lng: 77.2088,
            altitude: "Ground Level",
            sensors: ["Radio Mesh Signal Booster", "Obstacle LIDAR"],
            currentTask: "Stationary Relay Point near Evacuation Route",
            lastPing: "1 sec ago"
        }
    ],

    hazards: [
        {
            id: "HAZ-301",
            title: "LPG Industrial Gas Leakage",
            type: "Gas Leak",
            severity: "Critical", // Critical, Severe, Moderate, Caution
            lat: 28.6145,
            lng: 77.2105,
            radius: 120, // in meters
            detectedTime: "25 mins ago",
            detectedBy: "SQ-01 Drone (Gas Sniffer Array)",
            actionSop: "EVACUATE RADIUS 150M IMMEDIATELY. HAZMAT suits required. No open flames or electrical spark tools.",
            status: "Active Risk"
        },
        {
            id: "HAZ-302",
            title: "Class-4 Secondary Collapse Hazard",
            type: "Structural Breakdown",
            severity: "Critical",
            lat: 28.6158,
            lng: 77.2078,
            radius: 80,
            detectedTime: "40 mins ago",
            detectedBy: "SQ-03 Rover (LIDAR Deformation Sensor)",
            actionSop: "Do not use heavy machinery nearby. Shoring and pneumatic struts required before responder entry.",
            status: "Active Risk"
        },
        {
            id: "HAZ-303",
            title: "Live High-Voltage Transformer Cable",
            type: "Electrical Fire/Wire",
            severity: "Severe",
            lat: 28.6132,
            lng: 77.2120,
            radius: 50,
            detectedTime: "1 hr ago",
            detectedBy: "SQ-04 Rover",
            actionSop: "Power Grid Disconnect requested (State Electricity Board). Isolate perimeter with warning markers.",
            status: "Active Risk"
        },
        {
            id: "HAZ-304",
            title: "Sub-Surface Water Pipe Burst / Flooding",
            type: "Water Hazard",
            severity: "Moderate",
            lat: 28.6168,
            lng: 77.2110,
            radius: 60,
            detectedTime: "1 hr 30 mins ago",
            detectedBy: "SQ-02 Drone",
            actionSop: "Divert ground clearance path northwards toward Safe Route Bravo.",
            status: "Contained"
        }
    ],

    safeRoutes: [
        {
            id: "ROUTE-ALPHA",
            name: "Primary Evacuation Corridor (Sector 4 to Base Hospital)",
            status: "Clear & Verified",
            waypoints: [
                [28.6120, 77.2050],
                [28.6135, 77.2070],
                [28.6150, 77.2082],
                [28.6170, 77.2095],
                [28.6185, 77.2120]
            ],
            notes: "Paved clearance route verified by SQ-06 Heavy Rover. Width: 4.5m."
        },
        {
            id: "ROUTE-BETA",
            name: "Secondary Triage Air Ambulance Route",
            status: "Clear & Verified",
            waypoints: [
                [28.6180, 77.2060],
                [28.6172, 77.2080],
                [28.6160, 77.2115],
                [28.6145, 77.2140]
            ],
            notes: "Aerial corridor cleared of low-flying hazards for helicopter transport."
        }
    ],

    quickHelpLinks: [
        {
            title: "National Disaster Response Force (NDRF)",
            category: "Official Government Portal",
            url: "https://ndrf.gov.in/",
            description: "Official portal of India's apex disaster response agency. Guidelines, regional battalion contacts, and HQ deployment ops.",
            icon: "shield"
        },
        {
            title: "National Emergency Helpline (112)",
            category: "Emergency Helpline",
            url: "tel:112",
            description: "Single emergency response number across India for Police, Fire, Health, and Disaster Services.",
            icon: "phone"
        },
        {
            title: "National Disaster Management Authority (NDMA)",
            category: "Disaster Guidelines & SOPs",
            url: "https://ndma.gov.in/",
            description: "Official earthquake safety measures, structural audit checklists, and community response protocols.",
            icon: "book"
        },
        {
            title: "State Disaster Response Force (SDRF)",
            category: "State Level Command",
            url: "https://ndrf.gov.in/sdrf",
            description: "State-level emergency response force coordination directory and local control room numbers.",
            icon: "building"
        },
        {
            title: "IMD Earthquake & Aftershock Alerts",
            category: "Seismology & Weather",
            url: "https://mausam.imd.gov.in/",
            description: "India Meteorological Department real-time seismic epicenter reports, depth data, and weather advisory.",
            icon: "activity"
        },
        {
            title: "First Aid & Emergency Trauma Manual (NDMA/Red Cross)",
            category: "Field Medical SOPs",
            url: "https://www.indianredcross.org/",
            description: "Field protocols for crush injury syndrome, hemorrhaging control, fracture stabilization, and hypothermia.",
            icon: "heart"
        },
        {
            title: "Blood Bank & Medical Inventory Portal (e-RaktKosh)",
            category: "Hospital & Medical Locator",
            url: "https://www.eraktkosh.in/",
            description: "Real-time blood component availability across nearest regional hospitals and mobile trauma centers.",
            icon: "droplet"
        },
        {
            title: "Tele-MANAS Responder Mental Health Support",
            category: "Responder Well-being",
            url: "https://telemanas.mohfw.gov.in/",
            description: "24/7 free psychological helpline for disaster first responders and affected citizens (Toll-Free 14416).",
            icon: "smile"
        }
    ]
};
