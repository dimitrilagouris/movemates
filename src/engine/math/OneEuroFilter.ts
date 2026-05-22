/**
 * A basic low-pass filter to smooth signal noise.
 */
class LowPassFilter {
    private alpha: number = 1.0;
    private y: number;
    private s: number;
    private initialized: boolean = false;

    constructor(alpha: number, initVal: number = 0.0) {
        this.y = initVal;
        this.s = initVal;
        this.setAlpha(alpha);
    }

    public setAlpha(alpha: number): void {
        if (alpha <= 0.0 || alpha > 1.0) {
            console.warn("Alpha should be in (0.0, 1.0]");
        }
        this.alpha = alpha;
    }

    public filter(value: number): number {
        let result: number;
        if (this.initialized) {
            result = this.alpha * value + (1.0 - this.alpha) * this.s;
        } else {
            result = value;
            this.initialized = true;
        }
        this.y = value;
        this.s = result;
        return result;
    }

    public filterWithAlpha(value: number, alpha: number): number {
        this.setAlpha(alpha);
        return this.filter(value);
    }

    public hasLastRawValue(): boolean {
        return this.initialized;
    }

    public lastFilteredValue(): number {
        return this.s;
    }

    public reset(): void {
        this.initialized = false;
    }
}

/**
 * 1€ Filter: An adaptive low-pass filter to reduce jitter while maintaining responsiveness.
 * Useful for filtering noisy human-computer interaction signals like webcam skeletons.
 */
export class OneEuroFilter {
    private freq: number;
    private mincutoff: number;
    private beta: number;
    private dcutoff: number;
    private x: LowPassFilter;
    private dx: LowPassFilter;
    private lastTime?: number;

    constructor(freq: number, mincutoff: number = 1.0, beta: number = 0.0, dcutoff: number = 1.0) {
        this.freq = freq > 0 ? freq : 30;
        this.mincutoff = mincutoff > 0 ? mincutoff : 1.0;
        this.beta = beta;
        this.dcutoff = dcutoff > 0 ? dcutoff : 1.0;

        this.x = new LowPassFilter(this.calculateAlpha(this.mincutoff));
        this.dx = new LowPassFilter(this.calculateAlpha(this.dcutoff));
    }

    private calculateAlpha(cutoff: number): number {
        const te = 1.0 / this.freq;
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / te);
    }

    public filter(value: number, timestamp?: number): number {
        if (this.lastTime !== undefined && timestamp !== undefined && timestamp > this.lastTime) {
            this.freq = 1.0 / ((timestamp - this.lastTime) / 1000); // Expects seconds for Hz
        }
        this.lastTime = timestamp;

        const dValue = this.x.hasLastRawValue() ? (value - this.x.lastFilteredValue()) * this.freq : 0.0;
        const edValue = this.dx.filterWithAlpha(dValue, this.calculateAlpha(this.dcutoff));
        const cutoff = this.mincutoff + this.beta * Math.abs(edValue);

        return this.x.filterWithAlpha(value, this.calculateAlpha(cutoff));
    }

    public reset(): void {
        this.x.reset();
        this.dx.reset();
        this.lastTime = undefined;
    }

    public clone(): OneEuroFilter {
        return new OneEuroFilter(this.freq, this.mincutoff, this.beta, this.dcutoff);
    }
}