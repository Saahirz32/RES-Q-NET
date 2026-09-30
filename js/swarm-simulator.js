/**
 * RES-Q-NET - Background Autonomous Swarm Telemetry Simulator
 */

window.ResqSwarmSimulator = (function() {
    let simInterval = null;
    let isRunning = false;

    function startSimulation() {
        if (isRunning) return;
        isRunning = true;

        simInterval = setInterval(() => {
            if (!window.RESQ_DATA) return;

            const data = window.RESQ_DATA;

            // 1. Simulate Swarm Robot Movement & Telemetry
            data.robots.forEach(robot => {
                // Micro jitter coordinates to simulate live scanning navigation
                const deltaLat = (Math.random() - 0.5) * 0.00015;
                const deltaLng = (Math.random() - 0.5) * 0.00015;

                robot.lat = parseFloat((robot.lat + deltaLat).toFixed(5));
                robot.lng = parseFloat((robot.lng + deltaLng).toFixed(5));

                // Slow battery drain
                if (Math.random() > 0.6 && robot.battery > 5) {
                    robot.battery -= 1;
                    if (robot.battery < 20 && robot.status !== "Low Battery - Returning") {
                        robot.status = "Low Battery - Returning";
                        addSystemLog(`⚠️ ALERT: Robot ${robot.id} battery low (${robot.battery}%). Returning to base dock.`, "warning");
                    }
                }

                // Random RSSI fluctuation
                const rssiVals = ["-38 dBm", "-42 dBm", "-48 dBm", "-52 dBm", "-58 dBm"];
                robot.signalRssi = rssiVals[Math.floor(Math.random() * rssiVals.length)];
                robot.lastPing = "Just now";
            });

            // 2. Random Telemetry Log Emission
            if (Math.random() > 0.7) {
                const randomRobot = data.robots[Math.floor(Math.random() * data.robots.length)];
                const messages = [
                    `Node ${randomRobot.id} broadcasted 3D Pointcloud Mesh Packet to Base.`,
                    `Node ${randomRobot.id} completed thermal sweep of Sector 4 Grid-B.`,
                    `Multi-hop radio mesh signal stable at 14ms latency.`,
                    `Ground penetrating radar scan clear at current location.`
                ];
                const msg = messages[Math.floor(Math.random() * messages.length)];
                addSystemLog(`📡 ${msg}`, "info");
            }

            // 3. Trigger UI & Map Updates
            if (window.ResqMapEngine) {
                window.ResqMapEngine.refreshMap();
            }

            if (window.ResqApp) {
                window.ResqApp.updateDashboardWidgets();
            }

        }, 4000);

        console.log("RES-Q-NET Autonomous Swarm Telemetry Simulator Started");
    }

    function stopSimulation() {
        if (simInterval) {
            clearInterval(simInterval);
            isRunning = false;
        }
    }

    function addSystemLog(text, level = "info") {
        if (!window.RESQ_DATA.logs) {
            window.RESQ_DATA.logs = [];
        }

        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        const logEntry = {
            time: timeStr,
            text: text,
            level: level
        };

        window.RESQ_DATA.logs.unshift(logEntry);
        if (window.RESQ_DATA.logs.length > 50) {
            window.RESQ_DATA.logs.pop();
        }

        // Dispatch Custom Log Event
        window.dispatchEvent(new CustomEvent('resq-new-log', { detail: logEntry }));
    }

    return {
        start: startSimulation,
        stop: stopSimulation,
        addLog: addSystemLog
    };
})();
