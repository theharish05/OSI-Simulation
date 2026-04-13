let network = null;
let nodes = null;
let edges = null;

    const edgesConfig = [
        { id: 'e1', from: 'internet', to: 'hub' },
        { id: 'e2', from: 'hub', to: 'fw_cyber' },
        { id: 'e3', from: 'fw_cyber', to: 'py_server' },
        { id: 'e4', from: 'fw_cyber', to: 'sw_cyber' },
        { id: 'e5', from: 'sw_cyber', to: 'ap_cyber' },
        { id: 'e6', from: 'sw_cyber', to: 'device1_cyber' },
        { id: 'e7', from: 'ap_cyber', to: 'device2_cyber' }
    ];

    const nodeIPs = {
        'internet': '140.82.121.3',
        'hub': '10.0.0.1',
        'fw_cyber': '192.168.1.1',
        'py_server': '10.0.0.10',
        'sw_cyber': '192.168.1.2',
        'ap_cyber': '192.168.1.3',
        'device1_cyber': '192.168.1.50',
        'device2_cyber': '192.168.1.51'
    };

    const routingTables = {
        'fw_cyber': [
            { dest: '0.0.0.0/0', nextHop: '10.0.0.1', interface: 'WAN', id: 'internet' },
            { dest: '192.168.1.0/24', nextHop: '192.168.1.2', interface: 'LAN', id: 'sw_cyber' },
            { dest: '10.0.0.10/32', nextHop: '10.0.0.10', interface: 'DMZ', id: 'py_server' }
        ],
        'sw_cyber': [
            { dest: '0.0.0.0/0', nextHop: '192.168.1.1', interface: 'Gi0/1', id: 'fw_cyber' },
            { dest: '192.168.1.50/32', nextHop: '192.168.1.50', interface: 'Fa0/1', id: 'device1_cyber' },
            { dest: '192.168.1.3/32', nextHop: '192.168.1.3', interface: 'Fa0/2', id: 'ap_cyber' },
            { dest: '192.168.1.51/32', nextHop: '192.168.1.3', interface: 'Fa0/2', id: 'ap_cyber' }
        ],
        'ap_cyber': [
            { dest: '0.0.0.0/0', nextHop: '192.168.1.2', interface: 'Uplink', id: 'sw_cyber' },
            { dest: '192.168.1.3/32', nextHop: 'Local', interface: 'Mgmt', id: 'ap_cyber' },
            { dest: '192.168.1.51/32', nextHop: '192.168.1.51', interface: 'WLAN', id: 'device2_cyber' }
        ]
    };

document.addEventListener('DOMContentLoaded', () => {
    const makeSVG = (svgContent, color, bgColor) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><g fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${svgContent}</g></svg>`;
        return 'data:image/svg+xml;base64,' + window.btoa(svg);
    };

    const svgCloud = makeSVG('<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>', '#60a5fa', 'rgba(96,165,250,0.1)');
    const svgShield = makeSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', '#fb7185', 'rgba(251,113,133,0.1)');
    const svgServer = makeSVG('<rect x="4" y="3" width="16" height="8" rx="2" ry="2"/><rect x="4" y="13" width="16" height="8" rx="2" ry="2"/><line x1="8" y1="7" x2="8.01" y2="7"/><line x1="8" y1="17" x2="8.01" y2="17"/>', '#fbbf24', 'rgba(251,191,36,0.1)');
    const svgSwitch = makeSVG('<rect x="3" y="7" width="18" height="10" rx="2" ry="2"/><circle cx="8" cy="12" r="0.5"/><circle cx="12" cy="12" r="0.5"/><circle cx="16" cy="12" r="0.5"/>', '#34d399', 'rgba(52,211,153,0.1)');
    const svgMonitor = makeSVG('<rect x="3" y="4" width="18" height="12" rx="2" ry="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>', '#a78bfa', 'rgba(167,139,250,0.1)');
    const svgLaptop = makeSVG('<rect x="3" y="4" width="18" height="10" rx="2" ry="2"/><path d="M2 18l-1 2h22l-1-2Z"/>', '#a78bfa', 'rgba(167,139,250,0.1)');
    const svgWifi = makeSVG('<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>', '#38bdf8', 'rgba(56,189,248,0.1)');

    nodes = new vis.DataSet([
        { id: 'internet', label: 'INTERNET', shape: 'image', image: svgCloud, font: { color: '#60a5fa' }, size: 90, level: 0 },
        { id: 'hub', label: `NETWORK HUB\n${nodeIPs['hub']}`, shape: 'image', image: svgSwitch, font: { color: '#9ca3af' }, size: 75, level: 1 },
        { id: 'fw_cyber', label: `FIREWALL\n${nodeIPs['fw_cyber']}`, shape: 'image', image: svgShield, font: { color: '#fb7185' }, size: 90, level: 2 },
        { id: 'py_server', label: `SERVER\n${nodeIPs['py_server']}`, shape: 'image', image: svgServer, font: { color: '#fbbf24' }, size: 90, level: 3 },
        { id: 'sw_cyber', label: `CORE SWITCH\n${nodeIPs['sw_cyber']}`, shape: 'image', image: svgSwitch, font: { color: '#34d399' }, size: 75, level: 3 },
        { id: 'ap_cyber', label: `WIRELESS AP\n${nodeIPs['ap_cyber']}`, shape: 'image', image: svgWifi, font: { color: '#38bdf8' }, size: 75, level: 4 },
        { id: 'device1_cyber', label: `DESKTOP PC\n${nodeIPs['device1_cyber']}`, shape: 'image', image: svgMonitor, font: { color: '#a78bfa' }, size: 75, level: 4 },
        { id: 'device2_cyber', label: `LAPTOP\n${nodeIPs['device2_cyber']}`, shape: 'image', image: svgLaptop, font: { color: '#a78bfa' }, size: 75, level: 5 }
    ]);

    const defaultColor = 'rgba(255, 255, 255, 0.85)';
    edges = new vis.DataSet(edgesConfig.map(e => ({
        id: e.id, from: e.from, to: e.to,
        color: { color: defaultColor, highlight: '#3b82f6' },
        width: 2, smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 }
    })));

    const container = document.getElementById('network-container');
    const options = {
        nodes: {
            font: { face: 'Space Grotesk', size: 18, bold: true, background: 'rgba(10,10,10,0.85)', strokeWidth: 0, vadjust: -5 },
            shadow: { enabled: true, color: 'rgba(59, 130, 246, 0.15)', size: 30, x: 0, y: 0 }
        },
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed',
                levelSeparation: 220,
                nodeSpacing: 420
            }
        },
        physics: { enabled: false }, // Disabling physics sets exact (x, y) fixed routing!
        interaction: { dragNodes: true, dragView: true, zoomView: true, zoomSpeed: 0.3, hover: true }
    };
    
    document.fonts.ready.then(() => {
        network = new vis.Network(container, { nodes, edges }, options);
        network.on("beforeDrawing", syncPacketPosition);
    });

    if (window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": false, "anim": { "enable": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 3, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    // Auto-fit on window resize for responsiveness
    window.addEventListener('resize', () => {
        if (network) network.fit();
    });

    // Initialize Routing Table with Firewall entries
    setTimeout(() => updateRoutingPanel('fw_cyber', '10.0.0.10'), 500);
});

window.resetView = () => {
    if (network) network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    const toast = document.getElementById('toast');
    toast.className = 'toast';
};

const adjList = {};
edgesConfig.forEach(edge => {
    if (!adjList[edge.from]) adjList[edge.from] = [];
    if (!adjList[edge.to]) adjList[edge.to] = [];
    adjList[edge.from].push(edge.to);
    adjList[edge.to].push(edge.from);
});

function findPath(start, end) {
    let queue = [[start]];
    let visited = new Set([start]);
    while (queue.length > 0) {
        let path = queue.shift();
        let node = path[path.length - 1];
        if (node === end) return path;
        for (let neighbor of adjList[node] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor); queue.push([...path, neighbor]);
            }
        }
    }
    return null;
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-lock' : 'fa-shield-halved'}"></i> ${message}`;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

// --- INTERACTIVE STATE MACHINE OSI LOGIC ---
let simulationSteps = [];
let currentStepIdx = -1;
let currentPacket = null;
let activePacketNode = null;
let isAnimatingPacket = false;
let packetAnimTimeout = null;

let autoPlayTimer = null;
let isPlaying = true;

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('speed-slider');
    if(slider) {
        slider.addEventListener('input', (e) => {
             // Invert, lower slider is slower, higher slider is faster
        });
    }
});

function syncPacketPosition() {
    if (!currentPacket || !activePacketNode || isAnimatingPacket) return;
    try {
        const pos = network.canvasToDOM(network.getPositions([activePacketNode])[activePacketNode]);
        const scale = network.getScale();
        const container = document.getElementById('network-container');
        const offsetX = container ? container.getBoundingClientRect().left : 0;
        
        if (!currentPacket.classList.contains('shatter')) {
             currentPacket.style.transition = 'none';
        }
        
        const pt = document.getElementById('packet-dot-text');
        if (pt) {
            const baseFontSize = window.innerWidth > 2000 ? 1.8 : 1.25;
            pt.style.fontSize = `${baseFontSize * scale}rem`;
        }

        currentPacket.style.left = `${pos.x + offsetX}px`;
        currentPacket.style.top = `${pos.y}px`;
    } catch (e) {}
}

function setNarrator(text, isAlert = false) {
    // Narrator message rendering temporarily removed by design
}

function clearAllOSI() {
    document.querySelectorAll('.osi-layer').forEach(el => el.classList.remove('active', 'blocked'));
}

function highlightOSI(layer, status = 'active', targetStack = 'sender') {
    clearAllOSI();
    if (layer > 0 && layer <= 7) {
        document.getElementById(`${targetStack}-${layer}`).classList.add(status);
    }
}

function getLayerDownDescription(layer, sourceId, targetId) {
    const sName = nodes.get(sourceId).label.split('\n')[0];
    const tName = nodes.get(targetId).label.split('\n')[0];
    if (layer === 7) return `Layer 7 (Application): ${sName} generates a payload (e.g., an HTTP/Cyber request) for ${tName}.`;
    if (layer === 6) return `Layer 6 (Presentation): Formatting the payload into a standard syntax and optionally encrypting the data.`;
    if (layer === 5) return `Layer 5 (Session): Establishing a logical communication session and syncing state with ${tName}.`;
    if (layer === 4) return `Layer 4 (Transport): Segmenting the data and assigning Source/Destination Ports (e.g., TCP 443).`;
    if (layer === 3) return `Layer 3 (Network): Encapsulating into a Packet and adding logical routing endpoints (Source & Destination IPs).`;
    if (layer === 2) return `Layer 2 (Data Link): Framing the packet and applying local hardware identifiers (Source & Next-Hop MACs).`;
    if (layer === 1) return `Layer 1 (Physical): Converting the frame into electrical signals or light pulses for transmission over the wire!`;
    return '';
}

function getLayerUpDescription(layer, targetId) {
    const tName = nodes.get(targetId).label.split('\n')[0];
    if (layer === 1) return `Layer 1 (Physical): Electrical signals arrive and are decoded from the wire!`;
    if (layer === 2) return `Layer 2 (Data Link): Checking the Destination MAC Address to ensure the frame belongs to this hardware interface.`;
    if (layer === 3) return `Layer 3 (Network): Verifying the Destination IP Address matches this device. Packet accepted!`;
    if (layer === 4) return `Layer 4 (Transport): Routing the data segments to the correct listening service via the Destination Port.`;
    if (layer === 5) return `Layer 5 (Session): Connection state validated. Handshake and session context maintained.`;
    if (layer === 6) return `Layer 6 (Presentation): Decrypting the payload and parsing the data formats back into application objects.`;
    if (layer === 7) return `Layer 7 (Application): Success! ${tName} processes the cyber request payload!`;
    return '';
}

function updateNavButtons() {
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    
    if (pauseBtn && resumeBtn) {
        if (isPlaying) {
            pauseBtn.classList.add('active');
            resumeBtn.classList.remove('active');
        } else {
            pauseBtn.classList.remove('active');
            resumeBtn.classList.add('active');
        }

        if (currentStepIdx >= simulationSteps.length - 1) {
            pauseBtn.classList.remove('active');
            resumeBtn.classList.remove('active');
        }
    }
}

function spawnPacket(nodeId, text) {
    if (!currentPacket) {
        currentPacket = document.createElement('div');
        currentPacket.className = 'packet-dot';
        
        const popup = document.createElement('div');
        popup.className = 'packet-popup';
        popup.id = 'packet-popup';
        currentPacket.appendChild(popup);
        
        const dotText = document.createElement('div');
        dotText.id = 'packet-dot-text';
        currentPacket.appendChild(dotText);

        document.getElementById('packets-container').appendChild(currentPacket);
    }
    document.getElementById('packet-dot-text').innerText = text;
    currentPacket.classList.remove('shatter');
    movePacketTo(nodeId, false);
}

function movePacketTo(nodeId, animate) {
    if(!currentPacket) return;
    activePacketNode = nodeId;
    const pos = network.canvasToDOM(network.getPositions([nodeId])[nodeId]);
    const scale = network.getScale();

    const pt = document.getElementById('packet-dot-text');
    if (pt) {
        const baseFontSize = window.innerWidth > 2000 ? 1.8 : 1.25;
        pt.style.fontSize = `${baseFontSize * scale}rem`;
    }
    
    if (animate) {
        currentPacket.style.transition = 'left 0.6s linear, top 0.6s linear';
        isAnimatingPacket = true;
        clearTimeout(packetAnimTimeout);
        packetAnimTimeout = setTimeout(() => {
            isAnimatingPacket = false;
            syncPacketPosition();
        }, 600);
    } else {
        if (!currentPacket.classList.contains('shatter')) {
            currentPacket.style.transition = 'none';
        }
        isAnimatingPacket = false;
    }
    
    setTimeout(() => {
         if(!currentPacket) return;
         const container = document.getElementById('network-container');
         const offsetX = container ? container.getBoundingClientRect().left : 0;
         currentPacket.style.left = `${pos.x + offsetX}px`;
         currentPacket.style.top = `${pos.y}px`;
    }, 10);
}

let currentPduNode = null;

function updatePDUBox(step) {
    if (!step) return;

    // Update Device Info
    const pduDevice = document.getElementById('pdu-device-info');
    const pduRoute = document.getElementById('pdu-src-dst');
    if (pduDevice) {
        let nodeRef = nodes.get(step.dotNode);
        const currentNodeLabel = nodeRef && nodeRef.label !== '' ? nodeRef.label.replace('\n', ' ') : 'Network Sub-Bus';
        pduDevice.innerText = currentNodeLabel;
    }
    if (pduRoute) {
        pduRoute.innerHTML = `<span style="color:var(--primary)">Src:</span> ${step.srcName} | <span style="color:var(--warning)">Dst:</span> ${step.dstName}`;
    }

    // Reset layers only if device changes
    if (currentPduNode !== step.dotNode) {
        currentPduNode = step.dotNode;
        document.querySelectorAll('.pdu-layer').forEach(el => {
            el.classList.remove('active', 'blocked', 'layer-color', 'layer-l1', 'layer-l2', 'layer-l3', 'layer-l4', 'layer-l5', 'layer-l6', 'layer-l7');
            const descSpan = el.querySelector('.layer-desc');
            if (descSpan) descSpan.innerText = 'Waiting...';
        });
    }

    // Update Active Layer
    const activeLayerEl = document.getElementById(`pdu-l${step.layer}`);
    if (activeLayerEl) {
        if (step.type === 'blocked') {
            activeLayerEl.classList.add('blocked');
        } else {
            activeLayerEl.classList.add('active', 'layer-color', `layer-l${step.layer}`);
        }
        
        const descSpan = activeLayerEl.querySelector('.layer-desc');
        if (descSpan) {
            descSpan.innerText = step.msg || 'Processing...';
        }

        // Trigger Routing Table Update if at a layer 3 processing step
        if (step.layer === 3) {
            updateRoutingPanel(step.dotNode, step.dstIP);
        }
    }
}

function clearRoutingPanel() {
    const rtTitle = document.getElementById('rt-device-name');
    const rtBody = document.getElementById('rt-body');
    if (rtTitle) rtTitle.innerText = 'Idle';
    if (rtBody) {
        rtBody.innerHTML = `
            <tr class="rt-row"><td style="color:var(--text-muted);">--</td><td style="color:var(--text-muted);">--</td><td style="color:var(--text-muted);">--</td></tr>
            <tr class="rt-row"><td style="color:var(--text-muted);">--</td><td style="color:var(--text-muted);">--</td><td style="color:var(--text-muted);">--</td></tr>
        `;
    }
}

function updateRoutingPanel(nodeId, targetIP) {
    const rtPanel = document.getElementById('routing-table-box');
    const rtTitle = document.getElementById('rt-device-name');
    const rtBody = document.getElementById('rt-body');
    
    if (!rtPanel || !rtTitle || !rtBody) return;

    const table = routingTables[nodeId] || [];
    if (table.length === 0) {
        // Keep the last active table visible for context, but mark the device
        const nodeRef = nodes.get(nodeId);
        if (nodeRef) rtTitle.innerHTML = `${nodeRef.label.split('\n')[0]} <span style="font-size:0.6rem; color:var(--text-muted); opacity:0.8;">(N/A)</span>`;
        return;
    }

    const nodeRef = nodes.get(nodeId);
    rtTitle.innerText = nodeRef ? nodeRef.label.split('\n')[0] : 'Unknown';
    rtBody.innerHTML = '';

    table.forEach(entry => {
        const row = document.createElement('tr');
        row.className = 'rt-row';
        
        // Match logic based on upcoming path step
        const currentSimStep = simulationSteps[currentStepIdx];
        const nextNode = currentSimStep ? simulationSteps.find((s, i) => i > currentStepIdx && s.type === 'hop')?.dotNode : null;
        const matchesCurrentPath = entry.id === nextNode;

        if (matchesCurrentPath) row.classList.add('highlight');

        row.innerHTML = `
            <td>${entry.dest}</td>
            <td>${entry.nextHop}</td>
            <td>${entry.interface}</td>
        `;
        rtBody.appendChild(row);
    });
}

function applyState(isReverse) {
    if (currentStepIdx < 0 || currentStepIdx >= simulationSteps.length) return;
    const step = simulationSteps[currentStepIdx];
    
    highlightOSI(step.layer, step.type === 'blocked' ? 'blocked' : 'active', step.stackTarget);
    setNarrator(step.msg, step.type === 'blocked');
    
    updatePDUBox(step);

    // Toggle Routing Table Highlight and Values
    const rtBox = document.getElementById('routing-table-box');
    if (rtBox) {
        // Always populate the table with the current node's data so the user has time to read it!
        updateRoutingPanel(step.dotNode, step.dstIP);
        
        if (step.layer === 3) {
            rtBox.classList.add('l3-active');
        } else {
            rtBox.classList.remove('l3-active');
        }
    }
    
    if (step.dotNode) {
        if (!currentPacket) spawnPacket(step.dotNode, step.dotText);
        
        document.getElementById('packet-dot-text').innerText = step.dotText;
        currentPacket.classList.remove('shatter', 'layer-color', 'layer-l1', 'layer-l2', 'layer-l3', 'layer-l4', 'layer-l5', 'layer-l6', 'layer-l7');
        currentPacket.classList.add('layer-color', `layer-l${step.layer}`);
             
        // Update popup Content
        const popup = document.getElementById('packet-popup');
        if(popup) {
            popup.innerHTML = `
                <div class="popup-header ${step.type === 'blocked' ? 'blocked' : step.type === 'finish' ? 'finish' : ''}">
                    ${step.type === 'blocked' ? '<i class="fa-solid fa-shield-virus"></i> Blocked' : step.type === 'finish' ? '<i class="fa-solid fa-check"></i> Delivered' : '<i class="fa-solid fa-ethernet"></i> In Transit'}
                </div>
                <div class="popup-body">
                    <div><span class="lbl-src">SRC</span> ${step.srcName}</div>
                    <div><span class="lbl-dst">DST</span> ${step.dstName}</div>
                    <div class="popup-desc">${step.msg}</div>
                </div>
            `;
        }

        const slider = document.getElementById('speed-slider');
        let speedMs = slider ? (3100 - parseInt(slider.value)) : 1000;
        let animDuration = (speedMs * 0.6) / 1000;

        let animate = step.type === 'hop' || isReverse; // Animate heavily if moving between nodes
            
        if (animate) {
            currentPacket.style.transition = `left ${animDuration}s linear, top ${animDuration}s linear`;
        }

        movePacketTo(step.dotNode, animate);
    }
    
    if (step.type === 'blocked') {
        if (currentPacket) {
             document.getElementById('packet-dot-text').innerText = 'X';
             currentPacket.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
             currentPacket.classList.add('shatter');
             showToast('DENIAL: SECURITY POLICY VIOLATION', 'danger');
             
             document.body.classList.add('flash-red');
             setTimeout(() => document.body.classList.remove('flash-red'), 1200);
        }
    } else if (step.type === 'finish') {
        if (currentPacket) {
             document.getElementById('packet-dot-text').innerText = '✔';
             currentPacket.style.boxShadow = '0 0 12px #fff, 0 0 30px #00ffaa';
             showToast('CONNECTION ALLOWED', 'success');
             
             document.body.classList.add('flash-green');
             setTimeout(() => document.body.classList.remove('flash-green'), 1200);
        }
    } else {
        if (currentPacket) currentPacket.style.boxShadow = '0 0 12px #fff, 0 0 30px var(--primary)';
    }
    
    updateNavButtons();
}

function stepAuto() {
    if (!isPlaying) return;
    if (currentStepIdx < simulationSteps.length - 1) {
        currentStepIdx++;
        applyState(false);
        const slider = document.getElementById('speed-slider');
        let speedMs = slider ? (3100 - parseInt(slider.value)) : 1000;
        
        if (currentStepIdx < simulationSteps.length - 1) {
            autoPlayTimer = setTimeout(stepAuto, speedMs);
        } else {
            isPlaying = false;
            updateNavButtons();
        }
    }
}

window.pauseSimulation = () => {
    isPlaying = false;
    clearTimeout(autoPlayTimer);
    updateNavButtons();
};

window.resumeSimulation = () => {
    if (currentStepIdx >= simulationSteps.length - 1) return;
    isPlaying = true;
    updateNavButtons();
    stepAuto();
};

window.simulateTraffic = (sourceId, targetId) => {
    if (currentPacket && currentPacket.parentNode) currentPacket.remove();
    currentPacket = null;
    simulationSteps = [];
    currentStepIdx = -1;
    currentPduNode = null; // Reset PDU tracker for fresh simulations
    
    const path = findPath(sourceId, targetId);
    if (!path) return;

    const srcIP = nodeIPs[sourceId];
    const dstIP = nodeIPs[targetId];

    let blockIndex = -1;
    let isBlocked = false;

    if (sourceId === 'internet') {
        isBlocked = true;
        for (let i = 0; i < path.length; i++) { if (path[i] === 'fw_cyber') { blockIndex = i; break; } }
    } else if (sourceId === 'py_server') {
        // Block external internet bound traffic, but allow internal 192.168.1.0/24 traffic
        if (targetId === 'internet' || targetId === 'hub') {
            isBlocked = true;
            for (let i = 0; i < path.length; i++) { if (path[i] === 'fw_cyber') { blockIndex = i; break; } }
        }
    }

    const animationPath = isBlocked ? path.slice(0, blockIndex + 1) : path;
    const sName = nodes.get(sourceId).label.split('\n')[0];
    const tName = nodes.get(targetId).label.split('\n')[0];

    document.getElementById('sender-title').innerText = `SENDER: ${sName}`;
    document.getElementById('receiver-title').innerText = `RECEIVER: ${tName}`;

    // Sender 7 -> 1
    for(let i=7; i>=1; i--) {
        simulationSteps.push({
            type: 'layer', stackTarget: 'sender', layer: i, dotNode: sourceId, dotText: `L${i}`,
            msg: getLayerDownDescription(i, sourceId, targetId),
            srcName: sName, dstName: tName, dstIP: dstIP
        });
    }

    // Path hops
    let currentNode = sourceId;
    for(let i=0; i < animationPath.length - 1; i++) {
        let n2 = animationPath[i+1];
        let hopLayer = 1; let dotText = 'L1'; let hopMsg = "[HOP] Layer 1 (Physical): Signals propagating down the transmission media/cable.";
        if (n2.startsWith('sw_') || n2.startsWith('hub') || n2.startsWith('ap_')) { hopLayer = 2; dotText = 'L2'; hopMsg = "[HOP] Layer 2 Switch: Inspecting the Destination MAC address to forward the frame out the correct port."; }
        else if (n2.startsWith('fw_')) { hopLayer = 3; dotText = 'L3'; hopMsg = "[HOP] Layer 3 Firewall: Inspecting the IP packet against strict access control policies. Approved transition into subnet!"; }
        else if (n2 === 'internet') { hopLayer = 3; dotText = 'L3'; hopMsg = "[HOP] Global Internet Router: Forwarding the IP packet utilizing core routing tables."; }

        simulationSteps.push({ 
            type: 'hop', stackTarget: 'sender', layer: hopLayer, dotNode: n2, dotText: dotText, msg: hopMsg,
            srcName: sName, dstName: tName, dstIP: dstIP
        });
        currentNode = n2;
    }

    // Blocked vs Receiver
    if (isBlocked) {
        simulationSteps.push({ type: 'blocked', stackTarget: 'sender', layer: 3, dotNode: currentNode, dotText: 'X', msg: `[DENIED] Layer 3 Firewall rejects the packet! The IP/Port combination violates strict security rules. Packet dropped!`, srcName: sName, dstName: tName, dstIP: dstIP });
    } else {
        for(let i=1; i<=7; i++) {
            simulationSteps.push({
                type: i === 7 ? 'finish' : 'layer', stackTarget: 'receiver', layer: i, dotNode: currentNode, dotText: `L${i}`,
                msg: getLayerUpDescription(i, targetId),
                srcName: sName, dstName: tName, dstIP: dstIP
            });
        }
    }
    
    clearTimeout(autoPlayTimer);
    isPlaying = true;
    stepAuto();
};
