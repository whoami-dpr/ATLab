
import { pipeline, env } from '@xenova/transformers';

console.log("🤖 Worker script loaded!");

// Skip local model checks
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { audio, sampleRate, action } = event.data;

    self.postMessage({ status: 'debug', message: `Worker received action: ${action}` });

    if (action === 'transcribe') {
        try {
            // Notify main thread that we are starting
            self.postMessage({ status: 'start' });
            self.postMessage({ status: 'debug', message: 'Worker starting transcription process' });

            // Get the pipeline instance
            self.postMessage({ status: 'debug', message: 'Worker requesting pipeline instance...' });
            const transcriber = await PipelineSingleton.getInstance((data) => {
                // Send progress updates for model loading
                self.postMessage({
                    status: 'loading',
                    file: data.file,
                    progress: data.progress
                });
            });
            self.postMessage({ status: 'debug', message: 'Worker pipeline instance obtained' });

            // Run transcription
            // Pass raw audio data and sampling_rate
            self.postMessage({ status: 'debug', message: `Worker running inference on ${audio.length} samples at ${sampleRate}Hz` });
            const output = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
                sampling_rate: sampleRate
            });
            self.postMessage({ status: 'debug', message: 'Worker inference complete' });

            // Send result back
            self.postMessage({
                status: 'complete',
                text: output.text
            });

        } catch (error) {
            console.error("Worker error:", error);
            self.postMessage({ status: 'debug', message: `Worker error: ${error.message}` });
            self.postMessage({
                status: 'error',
                error: error.message
            });
        }
    }
});
