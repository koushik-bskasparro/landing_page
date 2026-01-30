import './style.css'
import { initPostHog } from './posthog.js'
import posthog from 'posthog-js'

// Initialize PostHog
initPostHog();

// --- Advanced Visual Debugger for User ---
async function showDebugPanel() {
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.right = '20px';
    panel.style.padding = '1.5rem';
    panel.style.background = 'rgba(0, 0, 0, 0.9)';
    panel.style.border = '1px solid #333';
    panel.style.color = '#fff';
    panel.style.borderRadius = '12px';
    panel.style.zIndex = '9999';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
    panel.style.maxWidth = '400px';

    const title = document.createElement('h3');
    title.textContent = 'PostHog Diagnostics';
    title.style.margin = '0 0 10px 0';
    title.style.color = '#0066FF';
    panel.appendChild(title);

    // Status Check
    const status = document.createElement('div');
    let configHost = 'Unknown';
    try {
        // Access internal config if available, or just use what we expect
        configHost = posthog.config ? posthog.config.api_host : (import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com (default)');
    } catch (e) { configHost = 'Error reading config'; }

    status.innerHTML = `
    <div><strong>Key:</strong> ...${import.meta.env.VITE_POSTHOG_KEY ? import.meta.env.VITE_POSTHOG_KEY.slice(-4) : 'MISSING'}</div>
    <div><strong>Host:</strong> ${configHost}</div>
    <div><strong>Opted Out:</strong> ${posthog.has_opted_out_capturing ? posthog.has_opted_out_capturing() : 'unknown'}</div>
  `;
    panel.appendChild(status);

    // Test Button
    const btn = document.createElement('button');
    btn.textContent = 'Test Network Connection';
    btn.style.marginTop = '10px';
    btn.style.padding = '8px 12px';
    btn.style.background = '#333';
    btn.style.border = '1px solid #555';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '4px';

    const log = document.createElement('div');
    log.style.marginTop = '10px';
    log.style.color = '#aaa';
    log.style.maxHeight = '100px';
    log.style.overflowY = 'auto';

    btn.onclick = async () => {
        log.innerHTML += '<div>Testing connection...</div>';
        try {
            // 1. Try sending via SDK
            posthog.capture('manual_debug_event', { note: 'User clicked test' });
            log.innerHTML += '<div style="color:#0f0">SDK Capture Called.</div>';

            // 2. Try raw fetch to verify network
            // Using /decide endpoint which is common for initial checks
            const checkUrl = `${configHost}/decide/?v=3&ip=1&_=123&ver=1.0.0`;

            const res = await fetch(checkUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: import.meta.env.VITE_POSTHOG_KEY, distinct_id: 'test_debug_' + Date.now() })
            });

            if (res.ok) {
                log.innerHTML += '<div style="color:#0f0">RAW Network: OK (200)</div>';
                const data = await res.json();
                console.log('PostHog Debug Response:', data);
            } else {
                log.innerHTML += `<div style="color:#f00">RAW Network: Error ${res.status}</div>`;
            }
        } catch (err) {
            log.innerHTML += `<div style="color:#f00">Network Failed: ${err.message}</div>`;
            log.innerHTML += `<div style="color:#f80">Possible Ad Blocker!</div>`;
        }
    };

    panel.appendChild(btn);
    panel.appendChild(log);
    document.body.appendChild(panel);
}

// Check if Key exists in Vite env
if (import.meta.env.VITE_POSTHOG_KEY) {
    // Wait slightly for DOM
    setTimeout(showDebugPanel, 1500);
} else {
    alert('PostHog Missing Key - Check .env file');
}

// Interaction logic will go here
console.log('Kasparro Landing Page Loaded');

// --- Event Tracking ---

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        // Track navigation event
        posthog.capture('navigation_click', {
            target_section: targetId,
            label: this.textContent.trim()
        });

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Track Form Submission
const form = document.querySelector('.connect-form');
if (form) {
    form.addEventListener('submit', (e) => {
        // Note: e.preventDefault is already inline, but we can add tracking here
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            posthog.identify(emailInput.value); // Identify user by email
            posthog.capture('form_submitted', {
                form_name: 'connect_with_us',
                email: emailInput.value
            });
        }
    });
}

// Track CTA Buttons specifically
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        posthog.capture('cta_click', {
            button_text: btn.textContent.trim()
        });
    });
});
