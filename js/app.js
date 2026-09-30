/**
 * RES-Q-NET - Main Application Controller & Router
 */

window.ResqApp = (function() {
    let currentRole = 'Viewer'; // Viewer, Coordinator, Admin
    let isLoggedIn = false;
    let audioAlertEnabled = true;
    let addMarkerMode = false;
    let activeSurvivorForAction = null;

    function init() {
        console.log("Initializing RES-Q-NET Main Application...");

        // Setup Event Listeners
        setupNavigation();
        setupThemeToggle();
        setupAudioToggle();
        setupAdminForm();
        setupContactForm();

        // Render Initial Views
        renderFleetGrid();
        renderSurvivorsTable();
        renderHazardsPanel();
        renderQuickHelpGrid();
        renderLogsFeed();

        // Start Swarm Background Telemetry Simulation
        if (window.ResqSwarmSimulator) {
            window.ResqSwarmSimulator.start();
        }

        // Listen for new log events
        window.addEventListener('resq-new-log', (e) => {
            renderLogsFeed();
        });

        // Initialize Map when Map page is first shown
        window.ResqMapEngine.initMap('leafletMap');
    }

    /* -------------------------------------------------------------------------- */
    /* Router & Navigation                                                        */
    /* -------------------------------------------------------------------------- */
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = btn.getAttribute('data-target');
                if (targetPage) {
                    switchPage(targetPage);
                }
            });
        });

        // Mobile drawer toggle
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navMenu = document.getElementById('navMenu');
        if (hamburgerBtn && navMenu) {
            hamburgerBtn.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-open');
            });
        }
    }

    function switchPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

        // Show target page
        const targetView = document.getElementById(pageId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Highlight nav item
        const activeNavBtn = document.querySelector(`.nav-btn[data-target="${pageId}"]`);
        if (activeNavBtn && activeNavBtn.parentElement) {
            activeNavBtn.parentElement.classList.add('active');
        }

        // Close mobile drawer if open
        const navMenu = document.getElementById('navMenu');
        if (navMenu) navMenu.classList.remove('mobile-open');

        // Trigger instant map resize & refresh if map page selected
        if (pageId === 'page-map') {
            if (window.ResqMapEngine) {
                window.ResqMapEngine.invalidateSize();
                window.ResqMapEngine.refreshMap();
                
                // Staggered size recalculations to guarantee zero gray-box delay
                setTimeout(() => window.ResqMapEngine.invalidateSize(), 50);
                setTimeout(() => window.ResqMapEngine.invalidateSize(), 150);
                setTimeout(() => window.ResqMapEngine.invalidateSize(), 350);
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* -------------------------------------------------------------------------- */
    /* Renderers for Views & Components                                           */
    /* -------------------------------------------------------------------------- */

    function updateDashboardWidgets() {
        if (!window.RESQ_DATA) return;
        const data = window.RESQ_DATA;

        // Update Stat Counters in Hero/Header
        const activeUnitsEl = document.getElementById('statActiveUnits');
        const totalSurvEl = document.getElementById('statTotalSurvivors');
        const activeHazardsEl = document.getElementById('statActiveHazards');

        if (activeUnitsEl) activeUnitsEl.textContent = data.robots.length;
        if (totalSurvEl) totalSurvEl.textContent = data.survivors.length;
        if (activeHazardsEl) activeHazardsEl.textContent = data.hazards.length;

        // Re-render sidebars
        renderMapSidebarSurvivors();
    }

    function renderMapSidebarSurvivors() {
        const container = document.getElementById('mapSidebarSurvivorsList');
        if (!container || !window.RESQ_DATA) return;

        container.innerHTML = '';
        window.RESQ_DATA.survivors.forEach(surv => {
            const item = document.createElement('div');
            item.className = `survivor-list-item`;
            
            let statusBadgeClass = 'badge-red';
            if (surv.status === 'Rescue In Progress') statusBadgeClass = 'badge-orange';
            if (surv.status === 'Rescued') statusBadgeClass = 'badge-green';

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="font-size: 0.95rem;">${surv.id}</strong>
                    <span class="badge ${statusBadgeClass}">${surv.status}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">
                    📍 ${surv.locationDetail}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                    <span>Confidence: <strong>${surv.confidence}%</strong></span>
                    <span>Sensor: ${surv.detectedBy}</span>
                </div>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <button onclick="window.ResqMapEngine.focusLocation(${surv.lat}, ${surv.lng})" class="btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; flex: 1;">
                        🎯 Focus Map
                    </button>
                    <button onclick="window.ResqApp.openSurvivorActionModal('${surv.id}')" class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;">
                        Update
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    function renderFleetGrid() {
        const container = document.getElementById('fleetGridContainer');
        if (!container || !window.RESQ_DATA) return;

        container.innerHTML = '';
        window.RESQ_DATA.robots.forEach(bot => {
            const card = document.createElement('div');
            card.className = 'robot-card';

            let batteryClass = 'high';
            if (bot.battery < 50) batteryClass = 'medium';
            if (bot.battery < 20) batteryClass = 'low';

            let statusBadgeClass = 'badge-blue';
            if (bot.status.includes('Low Battery')) statusBadgeClass = 'badge-red';
            if (bot.status.includes('Scanning')) statusBadgeClass = 'badge-green';

            card.innerHTML = `
                <div>
                    <div class="robot-header">
                        <div>
                            <div class="robot-id">${bot.id}</div>
                            <div class="robot-type">${bot.type}</div>
                        </div>
                        <span class="badge ${statusBadgeClass}">${bot.status}</span>
                    </div>

                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
                        <strong>Current Task:</strong> ${bot.currentTask}
                    </p>

                    <div class="battery-bar-container">
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                            <span>Battery Level</span>
                            <strong>${bot.battery}%</strong>
                        </div>
                        <div class="battery-bar-bg">
                            <div class="battery-bar-fill ${batteryClass}" style="width: ${bot.battery}%;"></div>
                        </div>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--bg-surface-border); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                    <span>📶 RSSI: <strong>${bot.signalRssi}</strong></span>
                    <span>📍 Lat: ${bot.lat.toFixed(4)}, Lng: ${bot.lng.toFixed(4)}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderSurvivorsTable() {
        const tbody = document.getElementById('survivorsTableBody');
        if (!tbody || !window.RESQ_DATA) return;

        tbody.innerHTML = '';
        window.RESQ_DATA.survivors.forEach(surv => {
            const tr = document.createElement('tr');
            
            let statusBadgeClass = 'badge-red';
            if (surv.status === 'Rescue In Progress') statusBadgeClass = 'badge-orange';
            if (surv.status === 'Rescued') statusBadgeClass = 'badge-green';

            tr.innerHTML = `
                <td><strong>${surv.id}</strong></td>
                <td><span class="badge badge-red">${surv.priority}</span></td>
                <td><span class="badge ${statusBadgeClass}">${surv.status}</span></td>
                <td>${surv.locationDetail}</td>
                <td>${surv.confidence}% (${surv.sensorType})</td>
                <td>${surv.vitals.heartRate} / ${surv.vitals.thermalTemp}</td>
                <td>
                    <button onclick="window.ResqApp.openSurvivorActionModal('${surv.id}')" class="btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;">
                        Manage
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderHazardsPanel() {
        const container = document.getElementById('hazardsGridContainer');
        if (!container || !window.RESQ_DATA) return;

        container.innerHTML = '';
        window.RESQ_DATA.hazards.forEach(h => {
            const card = document.createElement('div');
            card.className = 'feature-card red';

            card.innerHTML = `
                <div class="feature-icon">⚠️</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h3>${h.title}</h3>
                    <span class="badge badge-red">${h.severity}</span>
                </div>
                <p style="font-size: 0.85rem; margin-bottom: 12px;"><strong>Type:</strong> ${h.type} | Detected by ${h.detectedBy}</p>
                <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-md); font-size: 0.85rem; border-left: 3px solid var(--color-red);">
                    <strong>Action SOP:</strong> ${h.actionSop}
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderQuickHelpGrid() {
        const container = document.getElementById('quickHelpGridContainer');
        if (!container || !window.RESQ_DATA) return;

        container.innerHTML = '';
        window.RESQ_DATA.quickHelpLinks.forEach(item => {
            const card = document.createElement('div');
            card.className = 'help-card';

            card.innerHTML = `
                <div>
                    <div class="help-card-icon">🔗</div>
                    <span class="badge badge-orange" style="margin-bottom: 8px;">${item.category}</span>
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">${item.title}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
                        ${item.description}
                    </p>
                </div>
                <a href="${item.url}" target="_blank" rel="noopener" class="btn-primary" style="justify-content: center; font-size: 0.85rem;">
                    Launch External Official Portal ↗
                </a>
            `;
            container.appendChild(card);
        });
    }

    function renderLogsFeed() {
        const container = document.getElementById('systemLogsFeed');
        if (!container || !window.RESQ_DATA || !window.RESQ_DATA.logs) return;

        container.innerHTML = '';
        window.RESQ_DATA.logs.forEach(log => {
            const line = document.createElement('div');
            line.style.padding = '6px 0';
            line.style.borderBottom = '1px solid var(--bg-surface-border)';
            line.style.fontSize = '0.8rem';
            line.style.fontFamily = 'monospace';

            let color = 'var(--text-secondary)';
            if (log.level === 'warning') color = 'var(--color-orange)';
            if (log.level === 'danger') color = 'var(--color-red)';

            line.innerHTML = `<span style="color: var(--text-muted);">[${log.time}]</span> <span style="color: ${color};">${log.text}</span>`;
            container.appendChild(line);
        });
    }

    /* -------------------------------------------------------------------------- */
    /* Theme & Sound Controls                                                     */
    /* -------------------------------------------------------------------------- */
    function setupThemeToggle() {
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                themeBtn.textContent = isLight ? '🌙' : '☀️';
            });
        }
    }

    function setupAudioToggle() {
        const audioBtn = document.getElementById('audioToggleBtn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                audioAlertEnabled = !audioAlertEnabled;
                audioBtn.textContent = audioAlertEnabled ? '🔔' : '🔕';
            });
        }
    }

    function playEmergencyAlertSound() {
        if (!audioAlertEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.log("Audio play blocked by browser policy");
        }
    }

    /* -------------------------------------------------------------------------- */
    /* Admin Authentication & Action Modals                                       */
    /* -------------------------------------------------------------------------- */
    function setupAdminForm() {
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const roleSelect = document.getElementById('authRoleSelect');
                const role = roleSelect ? roleSelect.value : 'Admin';

                currentRole = role;
                isLoggedIn = true;

                document.getElementById('adminLoginSection').style.display = 'none';
                document.getElementById('adminDashboardSection').style.display = 'block';

                document.getElementById('adminRoleBadge').textContent = `Role: ${currentRole}`;
                if (window.ResqSwarmSimulator) {
                    window.ResqSwarmSimulator.addLog(`🔒 User logged in with role: ${currentRole}`, "info");
                }
            });
        }
    }

    function openSurvivorActionModal(survivorId) {
        activeSurvivorForAction = survivorId;
        const modal = document.getElementById('survivorModal');
        if (!modal) return;

        const surv = window.RESQ_DATA.survivors.find(s => s.id === survivorId);
        if (surv) {
            document.getElementById('modalSurvId').textContent = surv.id;
            document.getElementById('modalSurvStatusSelect').value = surv.status;
            modal.classList.add('active');
        }
    }

    function closeSurvivorActionModal() {
        const modal = document.getElementById('survivorModal');
        if (modal) modal.classList.remove('active');
    }

    function saveSurvivorStatusUpdate() {
        if (!activeSurvivorForAction) return;

        const newStatus = document.getElementById('modalSurvStatusSelect').value;
        const surv = window.RESQ_DATA.survivors.find(s => s.id === activeSurvivorForAction);
        
        if (surv) {
            surv.status = newStatus;
            playEmergencyAlertSound();

            if (window.ResqSwarmSimulator) {
                window.ResqSwarmSimulator.addLog(`🚨 Survivor ${surv.id} status updated to: ${newStatus}`, "warning");
            }

            renderSurvivorsTable();
            renderMapSidebarSurvivors();
            if (window.ResqMapEngine) window.ResqMapEngine.refreshMap();
            closeSurvivorActionModal();
        }
    }

    function setupContactForm() {
        const form = document.getElementById('emergencyContactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Emergency message dispatched directly to NDRF Command Center Queue.");
                form.reset();
            });
        }
    }

    return {
        init: init,
        switchPage: switchPage,
        updateDashboardWidgets: updateDashboardWidgets,
        openSurvivorActionModal: openSurvivorActionModal,
        closeSurvivorActionModal: closeSurvivorActionModal,
        saveSurvivorStatusUpdate: saveSurvivorStatusUpdate,
        isLoggedIn: () => isLoggedIn,
        isAddMarkerMode: () => addMarkerMode,
        playAlertSound: playEmergencyAlertSound
    };
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.ResqApp.init();
});
