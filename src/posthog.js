import posthog from 'posthog-js'

export function initPostHog() {
    if (typeof window !== 'undefined') {
        // Only initialize if the key is present
        if (import.meta.env.VITE_POSTHOG_KEY) {
            posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
                api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
                loaded: (posthog) => {
                    if (import.meta.env.DEV) posthog.debug()
                },
                // Enable all features as per request
                autocapture: true,
                capture_pageview: true,
                capture_pageleave: true,
                disable_session_recording: false,
                session_recording: {
                    maskAllInputs: false,
                    maskInputOptions: {
                        password: true,
                    },
                },
                // Heatmaps (via toolbar)
                heatmaps: true,
            })
            console.log('PostHog initialized for Kasparro');
        } else {
            console.warn('PostHog API Key not found. Please set VITE_POSTHOG_KEY in .env');
        }
    }
}

export default posthog
