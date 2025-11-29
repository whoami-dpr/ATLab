
console.log("🤖 MINIMAL WORKER LOADED");
self.postMessage({ status: 'debug', message: 'MINIMAL WORKER STARTED' });

self.addEventListener('message', (event) => {
    console.log("🤖 Worker received:", event.data);
    self.postMessage({ status: 'debug', message: 'Worker received message' });
});
