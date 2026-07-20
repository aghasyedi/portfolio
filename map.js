const mapData = {
    categories: [
        {
            id: 'quantum',
            label: 'QUANTUM\nCOMPUTING',
            color: '#a855f7', // Purple
            angle: -135,
            children: [
                'Algorithms',
                'Information',
                'Circuits',
                'Error Correction',
                'Quantum Simulation',
                { label: 'Qiskit', offsetX: 35 }
            ]
        },
        {
            id: 'qcomm',
            label: 'QUANTUM\nCOMMUNICATION',
            color: '#f59e0b', // Orange
            angle: -45,
            children: [
                { label: 'QKD', url: 'projects/bb84/index.html', offsetX: -35 },
                'Quantum Networks',
                'Photonics',
                { label: 'Free-Space Optical Links', offsetX: 35 },
                'Post-Quantum Cryptography'
            ]
        },
        {
            id: 'astro',
            label: 'ASTROPHYSICS',
            color: '#3b82f6', // Blue
            angle: 135,
            children: [
                'Black Holes',
                'Neutrino Physics',
                'Gravitational Waves',
                { label: 'Planetary Science', url: 'medium/index.html' },
                'Stellar Evolution'
            ]
        },
        {
            id: 'sci',
            label: 'SCIENTIFIC\nCOMPUTING',
            color: '#10b981', // Green
            angle: 45,
            children: [
                'Simulation',
                'Numerical Methods',
                'Data Analysis',
                'Software Engineering',
                'Python • C/C++ • JavaScript'
            ]
        }
    ],
    connections: [
        { from: 'Python • C/C++ • JavaScript', to: 'Qiskit' },
        { from: 'Python • C/C++ • JavaScript', to: 'Simulation' },
        { from: 'Simulation', to: 'ASTROPHYSICS' },
        { from: 'Simulation', to: 'QUANTUM\nCOMMUNICATION' },
        { from: 'Information', to: 'QUANTUM\nCOMMUNICATION' },
        { from: 'QUANTUM\nCOMPUTING', to: 'QUANTUM\nCOMMUNICATION' },
        { from: 'Data Analysis', to: 'ASTROPHYSICS' },
        { from: 'SCIENTIFIC\nCOMPUTING', to: 'QUANTUM\nCOMPUTING' },
        { from: 'SCIENTIFIC\nCOMPUTING', to: 'QUANTUM\nCOMMUNICATION' },
        { from: 'SCIENTIFIC\nCOMPUTING', to: 'ASTROPHYSICS' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('infographic');
    const svgLines = document.getElementById('map-lines');
    const centerNode = document.getElementById('node-center');

    if (!container) return;

    let r1 = window.innerWidth > 900 ? 220 : 150; // Inner radius
    let r2 = window.innerWidth > 900 ? 420 : 280; // Outer radius

    // Create a central offset based on container size
    let cx = container.offsetWidth / 2;
    let cy = container.offsetHeight / 2;

    const renderMap = () => {
        // Clear previous
        svgLines.innerHTML = '';
        document.querySelectorAll('.map-node, .mobile-only-msg').forEach(n => n.remove());

        cx = container.offsetWidth / 2;
        cy = container.offsetHeight / 2;

        if (cx === 0 || cy === 0) {
            setTimeout(renderMap, 50);
            return;
        }

        let maxR2X = cx - 120; // Safe distance horizontally
        let maxR2Y = cy - 50;  // Safe distance vertically

        let r2X = Math.min(maxR2X, 550);
        let r2Y = Math.min(maxR2Y, 400);

        if (r2X < 200) r2X = 200;
        if (r2Y < 150) r2Y = 150;

        let r1X = r2X * 0.65;
        let r1Y = r2Y * 0.65;

        // Increased minimums to accommodate the 1.3x larger (325px) center node
        if (r1X < 260) r1X = 260;
        if (r1Y < 260) r1Y = 260;

        centerNode.style.left = `${cx}px`;
        centerNode.style.top = `${cy}px`;

        if (window.innerWidth <= 768) {
            const msgEl = document.createElement('div');
            msgEl.className = 'mobile-only-msg';
            msgEl.innerText = 'Interactive map is best suited for desktop mode / Desktop only.';
            msgEl.style.position = 'absolute';
            msgEl.style.top = `${cy + 200}px`; /* Increased from 160px for the 1.3x larger center node */
            msgEl.style.left = '50%';
            msgEl.style.transform = 'translateX(-50%)';
            msgEl.style.color = 'var(--text-muted)';
            msgEl.style.textAlign = 'center';
            msgEl.style.fontSize = '0.9rem';
            msgEl.style.width = '80%';
            msgEl.style.maxWidth = '300px';
            msgEl.style.padding = '0.8rem';
            msgEl.style.background = 'var(--card-bg-subtle)';
            msgEl.style.borderRadius = 'var(--radius-md)';
            msgEl.style.border = '1px dashed var(--text-muted)';

            container.appendChild(msgEl);
            return;
        }

        window.nodeCoords = {};

        mapData.categories.forEach(cat => {
            const catRad = cat.angle * (Math.PI / 180);
            const catX = cx + Math.cos(catRad) * r1X;
            const catY = cy + Math.sin(catRad) * r1Y;

            // Draw line from center to cat
            const mainLine = drawLine(cx, cy, catX, catY, cat.color, 2);
            cat.lines = [mainLine];
            cat.childElements = [];

            // Create Cat Node
            const catEl = document.createElement('div');
            catEl.className = 'map-node cat-node';
            catEl.style.borderColor = cat.color;
            catEl.style.boxShadow = `0 0 20px ${cat.color}40`;
            catEl.style.setProperty('--theme', cat.color);
            catEl.innerHTML = cat.label.replace(/\n/g, '<br>');

            // Calculate precise offset so it centers at x, y
            container.appendChild(catEl);
            catEl.style.left = `${catX}px`;
            catEl.style.top = `${catY}px`;
            window.nodeCoords[cat.label] = { x: catX, y: catY, color: cat.color, el: catEl };

            // Hover interactions for dimming/glowing
            catEl.addEventListener('mouseenter', () => {
                container.classList.add('hovering');
                catEl.classList.add('active');
                cat.childElements.forEach(el => el.classList.add('active'));
                cat.lines.forEach(line => line.classList.add('active'));
                if (cat.connectedNodes) {
                    cat.connectedNodes.forEach(el => el.classList.add('semi-active'));
                }
            });
            catEl.addEventListener('mouseleave', () => {
                container.classList.remove('hovering');
                catEl.classList.remove('active');
                cat.childElements.forEach(el => el.classList.remove('active'));
                cat.lines.forEach(line => line.classList.remove('active'));
                if (cat.connectedNodes) {
                    cat.connectedNodes.forEach(el => el.classList.remove('semi-active'));
                }
            });

            // Render children
            const arcStart = cat.angle - 30;
            const arcEnd = cat.angle + 30;
            const step = (arcEnd - arcStart) / (cat.children.length - 1 || 1);

            cat.children.forEach((childItem, i) => {
                const childLabel = typeof childItem === 'object' ? childItem.label : childItem;
                const childUrl = typeof childItem === 'object' ? childItem.url : null;
                const childAngle = arcStart + i * step;
                const childRad = childAngle * (Math.PI / 180);
                let childX = cx + Math.cos(childRad) * r2X;
                let childY = cy + Math.sin(childRad) * r2Y;
                
                if (typeof childItem === 'object') {
                    if (childItem.offsetX) childX += childItem.offsetX;
                    if (childItem.offsetY) childY += childItem.offsetY;
                }

                // Line from cat to child
                const childLine = drawLine(catX, catY, childX, childY, cat.color, 1);
                cat.lines.push(childLine);

                // Child Node
                const childEl = document.createElement(childUrl ? 'a' : 'div');
                if (childUrl) {
                    childEl.href = childUrl;
                    childEl.style.textDecoration = 'none';
                    if (childUrl.startsWith('http')) childEl.target = '_blank';
                }
                childEl.className = 'map-node child-node';
                if (childUrl) childEl.classList.add('clickable-node');
                childEl.innerText = childLabel;
                // Add hover effect style variable
                childEl.style.setProperty('--theme', cat.color);

                container.appendChild(childEl);
                childEl.style.left = `${childX}px`;
                childEl.style.top = `${childY}px`;
                cat.childElements.push(childEl);
                window.nodeCoords[childLabel] = { x: childX, y: childY, color: cat.color, el: childEl };
            });
        });

        // Draw cross-connections
        if (mapData.connections) {
            mapData.connections.forEach(conn => {
                const nodeFrom = window.nodeCoords[conn.from];
                const nodeTo = window.nodeCoords[conn.to];
                if (nodeFrom && nodeTo) {
                    const line = drawLine(nodeFrom.x, nodeFrom.y, nodeTo.x, nodeTo.y, nodeFrom.color, 1);
                    line.setAttribute('stroke-dasharray', '5,5');
                    line.classList.add('cross-connection');
                    
                    // Add this line to the respective categories so it highlights on hover
                    mapData.categories.forEach(cat => {
                        const hasFrom = cat.label === conn.from || cat.children.some(c => (typeof c === 'object' ? c.label : c) === conn.from);
                        const hasTo = cat.label === conn.to || cat.children.some(c => (typeof c === 'object' ? c.label : c) === conn.to);
                        if (hasFrom || hasTo) {
                            cat.lines.push(line);
                            if (!cat.connectedNodes) cat.connectedNodes = [];
                            if (hasFrom && nodeTo.el && !cat.connectedNodes.includes(nodeTo.el)) {
                                cat.connectedNodes.push(nodeTo.el);
                            }
                            if (hasTo && nodeFrom.el && !cat.connectedNodes.includes(nodeFrom.el)) {
                                cat.connectedNodes.push(nodeFrom.el);
                            }
                        }
                    });
                }
            });
        }
    };

    const drawLine = (x1, y1, x2, y2, color, strokeWidth) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-opacity', '0.4');
        line.style.transition = 'all 0.3s ease';
        svgLines.appendChild(line);
        return line;
    };

    renderMap();

    window.addEventListener('resize', () => {
        requestAnimationFrame(renderMap);
    });
});
