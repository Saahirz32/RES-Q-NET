/**
 * RES-Q-NET - Operational Reports Generator & Data Exporter
 */

window.ResqReportsEngine = (function() {

    function exportSurvivorsCSV() {
        if (!window.RESQ_DATA || !window.RESQ_DATA.survivors) return;

        const survivors = window.RESQ_DATA.survivors;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Name,Status,Priority,Confidence,SensorType,DetectedBy,LocationDetail,HeartRate,Temperature,Respiration,Timestamp\n";

        survivors.forEach(s => {
            const row = [
                `"${s.id}"`,
                `"${s.name}"`,
                `"${s.status}"`,
                `"${s.priority}"`,
                `"${s.confidence}%"`,
                `"${s.sensorType}"`,
                `"${s.detectedBy}"`,
                `"${s.locationDetail.replace(/"/g, '""')}"`,
                `"${s.vitals.heartRate}"`,
                `"${s.vitals.thermalTemp}"`,
                `"${s.vitals.respiration}"`,
                `"${s.timestamp}"`
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `RESQ_NET_Survivors_Triage_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportSwarmTelemetryJSON() {
        if (!window.RESQ_DATA) return;

        const exportObj = {
            incident: window.RESQ_DATA.incident,
            robots: window.RESQ_DATA.robots,
            hazards: window.RESQ_DATA.hazards,
            exportTimestamp: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `RESQ_NET_Swarm_Telemetry_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function printIncidentReport() {
        if (!window.RESQ_DATA) return;

        const data = window.RESQ_DATA;
        const printWindow = window.open('', '_blank', 'width=850,height=900');

        let survivorsRows = data.survivors.map(s => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>${s.id}</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${s.priority}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${s.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${s.locationDetail}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${s.vitals.heartRate} / ${s.vitals.thermalTemp}</td>
            </tr>
        `).join('');

        let hazardsRows = data.hazards.map(h => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; color: #dc2626;"><strong>${h.id}</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${h.title} (${h.type})</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${h.severity}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${h.actionSop}</td>
            </tr>
        `).join('');

        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>RES-Q-NET Incident Operational Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
                    h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
                    .badge { background: #ea580c; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 24px; font-size: 13px; }
                    th { background: #f1f5f9; padding: 10px; border: 1px solid #ddd; text-align: left; }
                    .footer { font-size: 11px; color: #64748b; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 8px; }
                </style>
            </head>
            <body>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>RES-Q-NET Operational Command Report</h1>
                    <span class="badge">CONFIDENTIAL / NDRF FIELD SOP</span>
                </div>

                <p><strong>Incident ID:</strong> ${data.incident.id} | <strong>Scenario:</strong> ${data.incident.name}</p>
                <p><strong>Location:</strong> ${data.incident.location} | <strong>Epicenter:</strong> ${data.incident.epicenter}</p>
                <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>

                <h3>1. Survivor Triage Summary (${data.survivors.length} Total Detected)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Survivor ID</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Location Detail</th>
                            <th>Vital Pings</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${survivorsRows}
                    </tbody>
                </table>

                <h3>2. Active Hazards & Mitigation Protocols (${data.hazards.length} Hazards)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Hazard ID</th>
                            <th>Hazard Title</th>
                            <th>Severity</th>
                            <th>Recommended NDRF Action SOP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hazardsRows}
                    </tbody>
                </table>

                <h3>3. Autonomous Swarm Mesh Health</h3>
                <p><strong>Active Swarm Units:</strong> ${data.incident.activeUnits} Units | <strong>Mesh Link Status:</strong> ${data.incident.meshStatus}</p>

                <div class="footer">
                    RES-Q-NET Autonomous Multi-Robot Swarm Disaster Platform • Ministry of Home Affairs / NDRF Command Grid
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printHTML);
        printWindow.document.close();
    }

    return {
        exportSurvivorsCSV: exportSurvivorsCSV,
        exportSwarmTelemetryJSON: exportSwarmTelemetryJSON,
        printIncidentReport: printIncidentReport
    };
})();
