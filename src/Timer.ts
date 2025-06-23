export class Timer {
    private elapsedTime = 0;
    private intervalId: number | null = null;
    private onUpdate: (() => void) | null = null;

    setOnUpdate(callback: () => void) {
        this.onUpdate = callback;
    }

    start() {
        if (this.intervalId) return;
        this.intervalId = window.setInterval(() => {
            this.elapsedTime += 1000;
            if (this.onUpdate) this.onUpdate();
        }, 1000);
    }

    pause() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        } else {
            this.start();
        }
        if (this.onUpdate) this.onUpdate();
    }

    reset() {
        this.elapsedTime = 0;
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.onUpdate) this.onUpdate();
    }

    getFormattedTime(): string {
        const seconds = Math.floor(this.elapsedTime / 1000) % 60;
        const minutes = Math.floor(this.elapsedTime / 60000) % 60;
        const hours = Math.floor(this.elapsedTime / 3600000);
        const pad = (n: number) => (n < 10 ? "0" + n : n);
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
}