import dotenv from 'dotenv';
dotenv.config();

const WOL_IP = process.env.WOL_API_IP;

const now = new Date();
const tenSecondsLater = new Date(now.getTime() + 10 * 1000);

console.log('Current Time:', now.toISOString());
console.log('10 Seconds Later:', tenSecondsLater.toISOString());

console.log(tenSecondsLater.toISOString());

const res = await fetch(`http://${WOL_IP}:3000/schedule-wake`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        wake_at: tenSecondsLater.toISOString(),
    }),
});

if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
}

const data = await res.json();
console.log(data);
