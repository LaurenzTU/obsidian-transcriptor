import { Notice } from "obsidian";

export interface AudioRecorder {
    startRecording(): Promise<void>;
    pauseRecording(): Promise<void>;
    stopRecording(): Promise<Blob>;
    getRecordingState(): "inactive" | "recording" | "paused" | undefined;
    getMimeType(): string | undefined;
}

function getSupportedMimeType(): string {
    const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mp3"];
    for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            return mimeType;
        }
    }
    return "audio/webm"; // Default fallback
}

export class NativeAudioRecorder implements AudioRecorder {
    private chunks: BlobPart[] = [];
    private recorder: MediaRecorder | null = null;
    private mimeType: string;

    constructor() {
        this.mimeType = getSupportedMimeType();
    }

    getRecordingState(): "inactive" | "recording" | "paused" | undefined {
        return this.recorder?.state;
    }

    getMimeType(): string | undefined {
        return this.mimeType;
    }

    async startRecording(): Promise<void> {
        if (this.recorder) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = { mimeType: this.mimeType };
            const recorder = new MediaRecorder(stream, options);

            recorder.addEventListener("dataavailable", (e: BlobEvent) => {
                this.chunks.push(e.data);
            });

            this.recorder = recorder;
            this.recorder.start();
        } catch (err) {
            new Notice("Error initializing recorder: " + err.message);
            console.error("Error initializing recorder:", err);
        }
    }

    async pauseRecording(): Promise<void> {
        if (!this.recorder) return;

        if (this.recorder.state === "recording") {
            this.recorder.pause();
        } else if (this.recorder.state === "paused") {
            this.recorder.resume();
        }
    }

    async stopRecording(): Promise<Blob> {
        return new Promise((resolve) => {
            if (!this.recorder || this.recorder.state === "inactive") {
                const blob = new Blob(this.chunks, { type: this.mimeType });
                this.chunks.length = 0;
                resolve(blob);
                return;
            }
            
            this.recorder.addEventListener("stop", () => {
                const blob = new Blob(this.chunks, { type: this.mimeType });
                this.chunks.length = 0;

                if (this.recorder) {
                    this.recorder.stream.getTracks().forEach((track) => track.stop());
                    this.recorder = null;
                }
                resolve(blob);
            }, { once: true });

            this.recorder.stop();
        });
    }
}