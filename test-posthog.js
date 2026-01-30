// test-posthog.js
import dotenv from 'dotenv';
import { PostHog } from 'posthog-node';

dotenv.config();

const client = new PostHog(
    process.env.VITE_POSTHOG_KEY,
    { host: process.env.VITE_POSTHOG_HOST || 'https://app.posthog.com' }
);

console.log('--- PostHog Integration Test via Terminal ---');
console.log('Project Key:', process.env.VITE_POSTHOG_KEY ? 'Found (hidden)' : 'MISSING (Check .env)');
console.log('Host:', process.env.VITE_POSTHOG_HOST || 'https://app.posthog.com (default)');

if (!process.env.VITE_POSTHOG_KEY) {
    console.error('❌ Error: No API Key found. Make sure VITE_POSTHOG_KEY is set in .env');
    process.exit(1);
}

// Send a test event
console.log('\nSending test event...');
client.capture({
    distinctId: 'terminal-user',
    event: 'test_event_from_terminal',
    properties: {
        source: 'vs_code_terminal',
        message: 'Hello from the command line!'
    }
});

// Using a small delay or shutdown to flush
console.log('Flushing events...');
client.shutdown().then(() => {
    console.log('✅ Event sent successfully!');
    console.log('Please check your PostHog Dashboard > Activity / Events to confirm receipt.');
}).catch((err) => {
    console.error('❌ Failed to shutdown/flush:', err);
});
