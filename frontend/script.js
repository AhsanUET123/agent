// CIRO Emergency Operations Center - Core Logic
let map;
let crisisLayer;
let deferredPrompt;

// Configuration defaults
const DEFAULT_API_ENDPOINT = "http://127.0.0.1:8000";
let apiEndpoint = localStorage.getItem("CIRO_API_ENDPOINT") || DEFAULT_API_ENDPOINT;
let simulationMode = localStorage.getItem("CIRO_SIMULATION_MODE") === "true";

document.addEventListener("DOMContentLoaded", () => {
    // 1️⃣ Initialize Tactical Map with Pakistan Centered
    initializeTacticalMap();

    // 2️⃣ Start Digital clock (Local Time / System EOC Clock)
    startSystemClock();

    // 3️⃣ Register Service Worker for PWA (Netlify / App install support)
    registerServiceWorker();

    // 4️⃣ Setup PWA Installer Events
    setupAppInstaller();

    // Pre-fill inputs in settings modal state
    document.getElementById("apiEndpointInput").value = apiEndpoint;
    document.getElementById("simulationModeToggle").checked = simulationMode;
});

// Initialize Leaflet Map
function initializeTacticalMap() {
    // Center coordinates for Pakistan
    const pakistanCenter = [30.3753, 69.3451];
    const initialZoom = 5.5;

    map = L.map('map', {
        zoomControl: true,
        attributionControl: true
    }).setView(pakistanCenter, initialZoom);

    // 🗺 Load CartoDB Dark Matter Tile Layer (Futuristic Tactical Ops look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd'
    }).addTo(map);

    // Layer group to manage active telemetry markers
    crisisLayer = L.layerGroup().addTo(map);
}

// System clock simulation (EOC Standard Operating Time)
function startSystemClock() {
    const clockElement = document.getElementById("systemClock");
    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.innerText = `SYS TIME: ${hours}:${minutes}:${seconds} PKT`;
    }, 1000);
}

// Service Worker setup for installability on desktop/mobile
function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("./sw.js")
                .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
                .catch((err) => console.log("[PWA] Service Worker registration failed:", err));
        });
    }
}

// Handles PWA installability prompt triggers
function setupAppInstaller() {
    const btnInstall = document.getElementById("btnInstall");

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent default browser install banner
        e.preventDefault();
        deferredPrompt = e;
        
        // Show our high-tech glowing install button in the navbar!
        btnInstall.style.display = "flex";
    });

    btnInstall.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        
        // Trigger OS installation dialog
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Install choice outcome: ${outcome}`);
        
        // Clean up prompt
        deferredPrompt = null;
        btnInstall.style.display = "none";
    });

    // Hide if already installed
    window.addEventListener("appinstalled", () => {
        console.log("[PWA] CIRO App successfully installed on host OS!");
        btnInstall.style.display = "none";
    });
}

// Settings modal interactions
function toggleSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal.style.display === "none" || !modal.style.display) {
        // Sync elements with stored configurations before displaying
        document.getElementById("apiEndpointInput").value = apiEndpoint;
        document.getElementById("simulationModeToggle").checked = simulationMode;
        modal.style.display = "flex";
    } else {
        modal.style.display = "none";
    }
}

function saveSettings() {
    const inputEndpoint = document.getElementById("apiEndpointInput").value.trim();
    const toggleSim = document.getElementById("simulationModeToggle").checked;

    // Sanitize API Endpoint URL
    if (inputEndpoint) {
        apiEndpoint = inputEndpoint.endsWith("/") ? inputEndpoint.slice(0, -1) : inputEndpoint;
    } else {
        apiEndpoint = DEFAULT_API_ENDPOINT;
    }

    simulationMode = toggleSim;

    // Store in localStorage for persistent retrieval
    localStorage.setItem("CIRO_API_ENDPOINT", apiEndpoint);
    localStorage.setItem("CIRO_SIMULATION_MODE", String(simulationMode));

    toggleSettingsModal();
    
    // Quick status indicator blink to show save complete
    const statusText = document.getElementById("statusText");
    const oldText = statusText.innerText;
    statusText.innerText = "CONFIGURATIONS UPDATED";
    setTimeout(() => {
        statusText.innerText = oldText;
    }, 1500);
}

// Preset Telemetry scenarios for easy hackathon demoing
function loadPreset(scenarioType) {
    const textarea = document.getElementById("inputText");
    let presetText = "";

    switch(scenarioType) {
        case "flood_isl":
            presetText = "URGENT: Extreme urban flooding reported in Islamabad Sector G-10. Heavy water logs blocking all avenues. Multiple family vehicles stranded in deep water (pani bhar gaya) and need immediate rescue.";
            break;
        case "protest_lhr":
            presetText = "ALERT: Large-scale citizen protest blockade on Mall Road, Lahore near the assembly. Hundreds of people gathered. Traffic is fully stagnant, multiple vehicles stuck, emergency lanes blocked.";
            break;
        case "quake_kar":
            presetText = "CRITICAL: Citizens reporting moderate earthquake tremors in Karachi Clifton area. Structural tremors caused glass shatter and cracked walls in some commercial high rises. Citizens evacuating to open zones.";
            break;
        case "fire_pesh":
            presetText = "WARNING: Active commercial building fire outbreak in Peshawar near university road. Dense smoke visible, fire spreading to adjacent structures, local emergency dispatchers calling for fire tender backup.";
            break;
        default:
            presetText = "";
    }

    textarea.value = presetText;
    textarea.focus();
    textarea.style.borderColor = "var(--neon-cyan)";
    setTimeout(() => {
        textarea.style.borderColor = "rgba(255, 255, 255, 0.1)";
    }, 1000);
}

// Update Tactical Map with Crisis Coordinates and Threat Radius
function updateTacticalMap(lat, lng, severity, locationName, eventType) {
    crisisLayer.clearLayers();

    if (!lat || !lng || (lat === 0 && lng === 0)) {
        map.flyTo([30.3753, 69.3451], 5.5);
        return;
    }

    let color;
    let threatRadius = 3500; 
    
    const sevUpper = String(severity).toUpperCase();
    if (sevUpper === "HIGH") {
        color = "var(--neon-red)";
        threatRadius = 4500;
    } else if (sevUpper === "MEDIUM") {
        color = "var(--neon-orange)";
        threatRadius = 3000;
    } else {
        color = "var(--neon-yellow)";
        threatRadius = 1500;
    }

    // Custom tactical marker icon
    const tacticalIcon = L.divIcon({
        className: 'custom-tactical-marker',
        html: `<div style="
            width: 14px; 
            height: 14px; 
            background: ${color}; 
            border: 2px solid #fff; 
            border-radius: 50%; 
            box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const marker = L.marker([lat, lng], { icon: tacticalIcon }).addTo(crisisLayer);

    const popupContent = `
        <div style="min-width: 160px; font-family: var(--font-sans);">
            <h4>🚨 CRISIS IN PROGRESS</h4>
            <div style="font-size: 0.8rem; margin: 4px 0;">
                <strong>Event:</strong> <span style="text-transform: capitalize; color: ${color}; font-weight: bold;">${eventType}</span>
            </div>
            <div style="font-size: 0.8rem; margin: 4px 0;">
                <strong>Zone:</strong> <span style="text-transform: capitalize; font-weight: bold;">${locationName}</span>
            </div>
            <div style="font-size: 0.8rem; margin: 4px 0;">
                <strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </div>
            <div style="font-size: 0.8rem; margin: 4px 0;">
                <strong>Threat Radius:</strong> ${(threatRadius/1000).toFixed(1)} km
            </div>
        </div>
    `;
    
    marker.bindPopup(popupContent).openPopup();

    L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 1.5,
        radius: threatRadius,
        dashArray: "4, 6"
    }).addTo(crisisLayer);

    map.flyTo([lat, lng], 12.5, {
        animate: true,
        duration: 1.5
    });
}

// Core Fetch and Render Pipeline Execution
async function runCIRO() {
    const inputText = document.getElementById("inputText").value.trim();
    if (!inputText) {
        alert("Please enter a crisis report or select a preset scenario first.");
        return;
    }

    const statusIndicator = document.getElementById("statusIndicator");
    const statusText = document.getElementById("statusText");
    const loaderOverlay = document.getElementById("loaderOverlay");
    const standbyState = document.getElementById("standbyState");
    const telemetryGrid = document.getElementById("telemetryGrid");

    statusIndicator.className = "status-indicator busy";
    statusText.innerText = "CALCULATING ORCHESTRATION...";
    loaderOverlay.style.display = "flex";
    standbyState.style.display = "none";
    telemetryGrid.classList.remove("visible");

    // ⚡ FALLBACK LOCAL SIMULATOR ENGINE (for Netlify/Offline standalone presentations!)
    if (simulationMode) {
        setTimeout(() => {
            const simulatedPayload = runLocalSimulationEngine(inputText);
            renderTelemetry(simulatedPayload);
            
            statusIndicator.className = "status-indicator";
            statusText.innerText = "EOC ONLINE (SIMULATED)";
            loaderOverlay.style.display = "none";
            telemetryGrid.classList.add("visible");
        }, 1200); // 1.2s delay for a beautiful thinking transition feel!
        return;
    }

    // 📡 STANDARD API CONNECTIVITY PIPELINE
    try {
        const response = await fetch(
            `${apiEndpoint}/run?input_text=${encodeURIComponent(inputText)}`
        );

        if (!response.ok) {
            throw new Error(`System returned status code ${response.status}`);
        }

        const data = await response.json();
        
        setTimeout(() => {
            renderTelemetry(data);
            
            statusIndicator.className = "status-indicator";
            statusText.innerText = "EOC ONLINE";
            loaderOverlay.style.display = "none";
            telemetryGrid.classList.add("visible");
        }, 800);

    } catch (error) {
        console.error("CIRO Pipeline Ingestion Failure:", error);
        
        statusIndicator.className = "status-indicator error";
        statusText.innerText = "ORCHESTRATION PIPELINE ERROR";
        loaderOverlay.style.display = "none";
        standbyState.style.display = "flex";
        
        document.getElementById("standbyTitle").innerText = "PIPELINE OFFLINE";
        document.getElementById("standbyDesc").innerHTML = `
            <span style="color: var(--neon-red); font-weight: bold;">Ingestion failed.</span><br>
            Please verify that your FastAPI backend is running at:<br>
            <code style="background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px; color: var(--neon-cyan)">${apiEndpoint}</code><br><br>
            <strong>💡 Pro-Tip for presentations:</strong> Click "Configurations" in the navbar above and turn on **"Fallback Simulation Mode"** to instantly test and run the entire dashboard locally in your browser offline!
        `;
    }
}

// Convert Backend JSON payloads into Premium Visual HTML Telemetry
function renderTelemetry(data) {
    // -------------------------------------------------------------
    // A. CRISIS DETECTION DISPLAY
    // -------------------------------------------------------------
    const crisis = data.crisis || {};
    const geo = data.geo || {};
    
    document.getElementById("eventVal").innerText = crisis.event || "Unknown incident";
    
    const severity = crisis.severity || "LOW";
    const sevBadge = document.getElementById("severityVal");
    sevBadge.innerText = severity;
    sevBadge.className = `severity-badge badge-${severity.toLowerCase()}`;

    let confidenceVal = crisis.confidence || 0;
    if (confidenceVal <= 1.0) {
        confidenceVal = Math.round(confidenceVal * 100);
    } else {
        confidenceVal = Math.round(confidenceVal);
    }
    document.getElementById("confidenceText").innerText = `${confidenceVal}%`;
    document.getElementById("confidenceProgressFill").style.width = `${confidenceVal}%`;

    const emLevel = crisis.emergency_level || 1;
    const emLevelContainer = document.getElementById("emLevelRating");
    emLevelContainer.className = `emergency-level-rating level-${emLevel}`;

    const locName = geo.location || "Unknown Target Zone";
    const coords = geo.coords || { lat: 0, lng: 0 };
    document.getElementById("locationVal").innerText = locName;
    document.getElementById("coordsVal").innerText = `${coords.lat.toFixed(4)} N, ${coords.lng.toFixed(4)} E`;

    const reasons = crisis.reasons || [];
    const reasonsContainer = document.getElementById("reasonsVal");
    reasonsContainer.innerHTML = "";
    
    if (reasons.length > 0) {
        reasons.forEach(reason => {
            const item = document.createElement("p");
            item.style.marginBottom = "5px";
            item.innerHTML = `<span style="color: var(--neon-cyan);">&gt;</span> ${reason}`;
            reasonsContainer.appendChild(item);
        });
    } else {
        reasonsContainer.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No AI logic report returned</p>`;
    }

    // -------------------------------------------------------------
    // B. RECOMMENDED ACTION LISTS
    // -------------------------------------------------------------
    const actionsObj = data.actions || {};
    const actionList = actionsObj.actions || [];
    const actionsContainer = document.getElementById("actionsListContainer");
    actionsContainer.innerHTML = "";

    if (actionList.length > 0) {
        actionList.forEach(act => {
            const item = document.createElement("div");
            item.className = "checklist-item";
            item.innerHTML = `
                <div class="checklist-bullet"></div>
                <div class="checklist-text">${act}</div>
            `;
            actionsContainer.appendChild(item);
        });
    } else {
        actionsContainer.innerHTML = `
            <div class="checklist-item" style="color: var(--text-muted); font-style: italic;">
                No emergency actions currently planned. Surveillance continues.
            </div>
        `;
    }

    // -------------------------------------------------------------
    // C. SIMULATION RESULTS TELEMETRY
    // -------------------------------------------------------------
    const simWrapper = data.simulation || {};
    const sim = simWrapper.simulation || simWrapper || {};

    const beforeCongestion = Math.round((sim.traffic_before || 0) * 100);
    const afterCongestion = Math.round((sim.traffic_after || 0) * 100);
    const reduction = beforeCongestion - afterCongestion;

    document.getElementById("simBeforeVal").innerText = `${beforeCongestion}%`;
    document.getElementById("simBeforeFill").style.width = `${beforeCongestion}%`;
    
    document.getElementById("simAfterVal").innerText = `${afterCongestion}%`;
    document.getElementById("simAfterFill").style.width = `${afterCongestion}%`;

    const reductionElement = document.getElementById("simCongestionReduction");
    if (reduction > 0) {
        reductionElement.innerHTML = `Congestion reduced by <span style="color: var(--neon-green); font-weight: bold;">-${reduction}%</span> via rerouting.`;
    } else {
        reductionElement.innerHTML = "No net traffic congestion reduction simulated.";
    }

    const rescueVal = document.getElementById("simDispatchVal");
    if (sim.rescue_dispatched) {
        rescueVal.innerHTML = `<span style="color: var(--neon-green);">● ACTIVE</span> (Dispatched)`;
    } else {
        rescueVal.innerHTML = `<span style="color: var(--text-muted);">○ STANDBY</span> (No Dispatch Needed)`;
    }

    const outcomeStatus = sim.status || "CRITICAL";
    const statusVal = document.getElementById("simOutcomeStatus");
    statusVal.innerText = outcomeStatus;
    if (outcomeStatus.toUpperCase() === "IMPROVED") {
        statusVal.className = "sim-status-badge sim-status-improved";
    } else {
        statusVal.className = "sim-status-badge sim-status-critical";
    }

    // -------------------------------------------------------------
    // D. ALERTS & BROADCAST NETWORK
    // -------------------------------------------------------------
    const alertData = data.alerts || {};
    const alertsList = alertData.alerts || [];
    const channels = alertData.channels || {};
    const alertListContainer = document.getElementById("alertsListContainer");
    alertListContainer.innerHTML = "";

    updateChannelPill("pillSMS", channels.sms);
    updateChannelPill("pillApp", channels.app_notification);
    updateChannelPill("pillAuthority", channels.authority_report);

    if (alertsList.length > 0) {
        alertsList.forEach(alertText => {
            const item = document.createElement("div");
            const isCritical = alertText.startsWith("ALERT:") || alertText.includes("immediately") || alertText.includes("Avoid");
            item.className = `alert-message ${isCritical ? 'critical-alert' : ''}`;
            item.innerText = alertText;
            alertListContainer.appendChild(item);
        });
    } else {
        alertListContainer.innerHTML = `<div style="color: var(--text-muted); font-style: italic; font-size: 0.8rem;">No alert broadcasts active at this moment.</div>`;
    }

    // -------------------------------------------------------------
    // E. MAP REPOSITIONING & RADIUS RENDER
    // -------------------------------------------------------------
    updateTacticalMap(coords.lat, coords.lng, severity, locName, crisis.event || "crisis");
}

// Helper to switch visual active states on alert pills
function updateChannelPill(elementId, isActive) {
    const pill = document.getElementById(elementId);
    if (!pill) return;
    
    if (isActive) {
        pill.classList.add("active");
        pill.innerText = pill.innerText.replace("○", "●").replace("OFFLINE", "ACTIVE");
    } else {
        pill.classList.remove("active");
        pill.innerText = pill.innerText.replace("●", "○").replace("ACTIVE", "OFFLINE");
    }
}

// 🧠 MULTI-AGENT PIPELINE SIMULATOR (Local Offline Engine)
// This simulates identical JSON returns based on report contents.
function runLocalSimulationEngine(inputText) {
    const text = inputText.toLowerCase();
    
    // Core default fallbacks
    let event = "unknown";
    let severity = "LOW";
    let confidence = 0.85;
    let emergency_level = 1;
    let location = "unknown";
    let lat = 30.3753;
    let lng = 69.3451;
    let reasons = ["Ingested unformatted broadcast reports."];
    let actions = ["Monitor situation in real-time.", "Log incident for surveillance."];
    let beforeTraffic = 0.55;
    let afterTraffic = 0.55;
    let rescue = false;
    let alertsSent = false;
    let alertsList = ["Monitoring system for active signals."];
    let smsActive = false;
    let appActive = true;
    let authActive = false;

    // Detect Islamabad Sector G-10 Floods
    if (text.includes("g-10") || text.includes("flood") || text.includes("pani")) {
        event = "Flood";
        severity = "HIGH";
        confidence = 0.98;
        emergency_level = 3;
        location = "g-10 (Islamabad)";
        lat = 33.6844;
        lng = 73.0479;
        reasons = [
            "Detected keyword markers: 'flooding', 'pani bhar gaya' and 'stranded'.",
            "Urdu telemetry confirms cars are stuck due to extreme local rain accumulation.",
            "Water levels exceeding standard curbs in residential sector G-10."
        ];
        actions = [
            "Reroute Islamabad local transit away from G-10 service avenues.",
            "Dispatch CDA Municipal Emergency Rescue Team immediately.",
            "Send flash urban flood alerts to citizens in G-10, G-11 sectors.",
            "Notify Islamabad Disaster Management Authority for pumps mobilization."
        ];
        beforeTraffic = 0.92;
        afterTraffic = 0.48; // Rerouted!
        rescue = true;
        alertsSent = true;
        smsActive = true;
        appActive = true;
        authActive = true;
        alertsList = [
            "ALERT: Flood emergency active in Sector G-10, Islamabad.",
            "Avoid low-lying avenues immediately. Emergency rescue teams responding.",
            "Follow municipal directions and seek elevated ground."
        ];
    }
    // Detect Lahore Mall Road Protest
    else if (text.includes("protest") || text.includes("assembly") || text.includes("lahore")) {
        event = "Protest";
        severity = "MEDIUM";
        confidence = 0.94;
        emergency_level = 2;
        location = "lahore";
        lat = 31.5204;
        lng = 74.3587;
        reasons = [
            "Detected protest keywords and assembly crowd telemetry.",
            "Visual reports indicate stagnant transit clusters around Mall Road.",
            "Identified major traffic lane blockages."
        ];
        actions = [
            "Establish police buffer perimeters around Mall Road Assembly.",
            "Reroute transit grid via Canal Road and Jail Road.",
            "Send cautious travel warnings to citizens in central Lahore."
        ];
        beforeTraffic = 0.85;
        afterTraffic = 0.60;
        rescue = false;
        alertsSent = true;
        smsActive = true;
        appActive = true;
        authActive = false;
        alertsList = [
            "WARNING: Public protest assembly active on Mall Road, Lahore.",
            "Expect delays and blocked routes. Reroute via outer Canal Road."
        ];
    }
    // Detect Karachi Tremors
    else if (text.includes("earthquake") || text.includes("tremor") || text.includes("karachi")) {
        event = "Earthquake";
        severity = "HIGH";
        confidence = 0.90;
        emergency_level = 3;
        location = "karachi";
        lat = 24.8607;
        lng = 67.0011;
        reasons = [
            "Identified seismic activity signals in commercial high-rises.",
            "Structural reports indicate cracked masonry and glass shatter.",
            "Large citizen evacuations in high-density Clifton sectors."
        ];
        actions = [
            "Activate Karachi Civil Defense emergency operations.",
            "Mobilize structural safety evaluation teams in Clifton.",
            "Broadcast emergency evacuation and open-space shelter guidelines."
        ];
        beforeTraffic = 0.78;
        afterTraffic = 0.68; // High severity panic
        rescue = true;
        alertsSent = true;
        smsActive = true;
        appActive = true;
        authActive = true;
        alertsList = [
            "ALERT: Seismic tremors reported in Karachi Clifton. Check structures.",
            "Avoid indoor spaces if buildings show fractures. Standby for civil safety instructions."
        ];
    }
    // Detect Peshawar Building Fire
    else if (text.includes("fire") || text.includes("peshawar")) {
        event = "Fire";
        severity = "HIGH";
        confidence = 0.96;
        emergency_level = 3;
        location = "peshawar";
        lat = 34.0151;
        lng = 71.5249;
        reasons = [
            "Thermal report validates building fire near university road.",
            "High threat of structure-to-structure convection spreads.",
            "Peshawar dispatchers calling for auxiliary tender deployments."
        ];
        actions = [
            "Dispatch Peshawar central fire tender units to university road.",
            "Establish safety zone perimeter restricting public entries.",
            "Coordinate water tanker reinforcements from municipal authorities."
        ];
        beforeTraffic = 0.70;
        afterTraffic = 0.40;
        rescue = true;
        alertsSent = true;
        smsActive = true;
        appActive = true;
        authActive = true;
        alertsList = [
            "ALERT: Active structural fire reported near University Road, Peshawar.",
            "Restricted access in safety zones. Yield right-of-way to fire tender dispatchers."
        ];
    }

    // Return exact matching payload format
    return {
        "signal": {
            "location": location,
            "issue": event,
            "vehicles_stranded": rescue
        },
        "geo": {
            "location": location,
            "coords": { "lat": lat, "lng": lng }
        },
        "crisis": {
            "event": event,
            "severity": severity,
            "confidence": confidence,
            "emergency_level": emergency_level,
            "reasons": reasons
        },
        "actions": {
            "actions": actions,
            "priority": severity === "HIGH" ? "IMMEDIATE" : (severity === "MEDIUM" ? "HIGH" : "NORMAL")
        },
        "simulation": {
            "traffic_before": beforeTraffic,
            "traffic_after": afterTraffic,
            "alerts_sent": alertsSent,
            "rescue_dispatched": rescue,
            "status": afterTraffic < 0.55 ? "IMPROVED" : "CRITICAL"
        },
        "alerts": {
            "alerts": alertsList,
            "channels": {
                "sms": smsActive,
                "app_notification": appActive,
                "authority_report": authActive
            }
        }
    };
}
