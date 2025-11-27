// Base64 to Uint8Array decoder
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM data into an AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Convert AudioBuffer to WAV format (Blob) for downloading
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this example)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      // scale to 16-bit signed int
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

// Convert AudioBuffer to MP3 (best-effort, falls back to WAV if MediaRecorder is unavailable)
export async function audioBufferToMp3(buffer: AudioBuffer): Promise<Blob> {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return audioBufferToWav(buffer);
  }

  const supportedMime = ['audio/mpeg', 'audio/webm', 'audio/ogg'].find((type) =>
    (MediaRecorder as any).isTypeSupported ? MediaRecorder.isTypeSupported(type) : false
  );

  if (!supportedMime) {
    return audioBufferToWav(buffer);
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const destination = audioContext.createMediaStreamDestination();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);

  return new Promise((resolve, reject) => {
    const recorder = new MediaRecorder(destination.stream, { mimeType: supportedMime });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.onerror = (event) => {
      console.error('MediaRecorder error', event);
      resolve(audioBufferToWav(buffer));
    };

    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: supportedMime }));
    };

    recorder.start();
    source.start(0);

    // Stop after the buffer duration plus a small buffer
    setTimeout(() => {
      recorder.stop();
      source.stop();
      audioContext.close();
    }, buffer.duration * 1000 + 300);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
