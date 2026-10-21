/**
 * Web Audio API synthesizer for positive, error and notification cues
 */

export const playSuccessSound = () => {
 try {
 const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
 if (!AudioContextClass) return;
 const ctx = new AudioContextClass();

 const now = ctx.currentTime;
 const osc1 = ctx.createOscillator();
 const osc2 = ctx.createOscillator();
 const gainNode = ctx.createGain();

 osc1.type = "sine";
 osc2.type = "triangle";

 // Play pleasant ascending chord (E5 -> B5)
 osc1.frequency.setValueAtTime(659.25, now);
 osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.18);

 osc2.frequency.setValueAtTime(329.63, now);
 osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.18);

 gainNode.gain.setValueAtTime(0.15, now);
 gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

 osc1.connect(gainNode);
 osc2.connect(gainNode);
 gainNode.connect(ctx.destination);

 osc1.start(now);
 osc2.start(now);
 osc1.stop(now + 0.35);
 osc2.stop(now + 0.35);
 } catch (e) {
 // Graceful degradation if audio context is blocked by browser policy
 }
};

export const playErrorSound = () => {
 try {
 const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
 if (!AudioContextClass) return;
 const ctx = new AudioContextClass();

 const now = ctx.currentTime;
 const osc = ctx.createOscillator();
 const gainNode = ctx.createGain();

 osc.type = "sawtooth";
 osc.frequency.setValueAtTime(220, now);
 osc.frequency.setValueAtTime(160, now + 0.1);

 gainNode.gain.setValueAtTime(0.2, now);
 gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

 osc.connect(gainNode);
 gainNode.connect(ctx.destination);

 osc.start(now);
 osc.stop(now + 0.25);
 } catch (e) {
 // Graceful degradation
 }
};

export const playNotificationSound = () => {
 try {
 const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
 if (!AudioContextClass) return;
 const ctx = new AudioContextClass();

 const now = ctx.currentTime;
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();

 osc.type = "sine";
 osc.frequency.setValueAtTime(880, now);
 osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);

 gain.gain.setValueAtTime(0.12, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

 osc.connect(gain);
 gain.connect(ctx.destination);

 osc.start(now);
 osc.stop(now + 0.22);
 } catch (e) {
 // Graceful degradation
 }
};
