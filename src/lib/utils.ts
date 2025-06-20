import { util, webpack } from "replugged";
import {
  fluxDispatcher as FluxDispatcher,
  toast as Toast,
  messages as UltimateMessageStore,
} from "replugged/common";
import Modules from "./requiredModules";
import Types from "../types";
import { PluginLogger } from "..";

export const isObject = (testMaterial: unknown): boolean =>
  typeof testMaterial === "object" && !Array.isArray(testMaterial) && testMaterial != null;

export const getWaveForm = (audioBuffer: AudioBuffer): string => {
  const channelData = audioBuffer.getChannelData(0);
  const nums = Math.min(256, Math.floor(audioBuffer.duration * 10));
  const samples = Math.floor(channelData.length / nums);
  const uinitArray = new Uint8Array(nums);
  for (const binIdx of Array(nums).keys()) {
    const sumOfSquares = Array(samples)
      .fill(0)
      .reduce((acc, _, sampleOffset) => {
        const sampleIdx = binIdx * samples + sampleOffset;
        return acc + channelData[sampleIdx] ** 2;
      }, 0);
    uinitArray[binIdx] = Math.sqrt(sumOfSquares / samples) * 0xff;
  }
  const maxBin = Math.max(...uinitArray);
  const ratio = 1 + (0xff / maxBin - 1) * Math.min(1, 100 * (maxBin / 0xff) ** 3);
  for (const [i, bin] of uinitArray.entries()) {
    uinitArray[i] = Math.min(0xff, Math.floor(bin * ratio));
  }
  return btoa(String.fromCharCode(...uinitArray));
};

export const setLoopback = ({ enabled, volume }: { enabled: boolean; volume: number }): void => {
  FluxDispatcher.dispatch({
    type: "AUDIO_SET_LOOPBACK",
    loopbackReason: "recording",
    enabled,
  });
  FluxDispatcher.dispatch({
    type: "AUDIO_SET_OUTPUT_VOLUME",
    volume,
  });
};

export const startRecording = (name: string, callback: (file: File) => void): void => {
  const { MediaEngineStore } = Modules;
  const MediaEngine = MediaEngineStore.getMediaEngine();
  if (!MediaEngine) return;

  const volume = MediaEngineStore.getOutputVolume();
  setLoopback({ enabled: true, volume: 0 });

  MediaEngine.startRecordingRawSamples((samples, numChannels, sampleRate) => {
    setLoopback({ enabled: false, volume });

    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const wavHeaderSize = 44;
    const buffer = new ArrayBuffer(wavHeaderSize + samples.length * bytesPerSample);
    const view = new DataView(buffer);

    const writeString = (view, str, offset): number => {
      [...str].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
      return offset + str.length;
    };

    const getHeaderOffset = (view, samples, numChannels, sampleRate): number => {
      const offsetAfterRiff = writeString(view, "RIFF", 0);
      view.setUint32(offsetAfterRiff, 36 + samples.length * bytesPerSample, true);
      const offsetAfterChunkSize = offsetAfterRiff + 4;
      const offsetAfterWave = writeString(view, "WAVE", offsetAfterChunkSize); //

      const offsetAfterFmt = writeString(view, "fmt ", offsetAfterWave);
      view.setUint32(offsetAfterFmt, 16, true);
      const offsetAfterSubchunk1Size = offsetAfterFmt + 4;
      view.setUint16(offsetAfterSubchunk1Size, 1, true);
      const offsetAfterAudioFormat = offsetAfterSubchunk1Size + 2;
      view.setUint16(offsetAfterAudioFormat, numChannels, true);
      const offsetAfterNumChannels = offsetAfterAudioFormat + 2;
      view.setUint32(offsetAfterNumChannels, sampleRate, true);
      const offsetAfterSampleRate = offsetAfterNumChannels + 4;
      view.setUint32(offsetAfterSampleRate, byteRate, true);
      const offsetAfterByteRate = offsetAfterSampleRate + 4;
      view.setUint16(offsetAfterByteRate, blockAlign, true);
      const offsetAfterBlockAlign = offsetAfterByteRate + 2;
      view.setUint16(offsetAfterBlockAlign, bytesPerSample * 8, true);
      const offsetAfterBitsPerSample = offsetAfterBlockAlign + 2;

      const offsetAfterData = writeString(view, "data", offsetAfterBitsPerSample);
      view.setUint32(offsetAfterData, samples.length * bytesPerSample, true);
      return offsetAfterData + 4;
    };

    const startSamplesOffset = getHeaderOffset(view, samples, numChannels, sampleRate);
    samples.entries().forEach(([i, sample]) => {
      view.setInt16(startSamplesOffset + i * 2, sample, true);
    });

    // It is encoded WAV but nor discord care neither me
    const blob = new Blob([buffer], { type: "audio/ogg" });
    const file = new File([blob], `${name}.ogg`, { type: "audio/ogg; codecs=opus" });
    callback(file);
  });
};

export const stopRecording = (): void => {
  const { MediaEngineStore } = Modules;
  const MediaEngine = MediaEngineStore.getMediaEngine();
  if (!MediaEngine) return;

  MediaEngine.stopRecordingRawSamples();
};

export const timestampToSnowflake = (timestamp: number): string => {
  const DISCORD_EPOCH = BigInt(1420070400000);
  const SHIFT = BigInt(22);

  const ms = BigInt(timestamp) - DISCORD_EPOCH;
  return ms <= BigInt(0) ? "0" : (ms << SHIFT).toString();
};

export const sendVoiceMessage = ({
  file,
  channelId,
  waveform,
  durationSecs,
}: {
  file: File;
  channelId: string;
  waveform: string;
  durationSecs: number;
}): void => {
  const { PendingReplyStore, CloudUpload } = Modules;
  const replyOptions: Types.SendMessageOptionsForReply =
    UltimateMessageStore.getSendMessageOptionsForReply(
      PendingReplyStore.getPendingReply(channelId),
    );
  if (replyOptions.messageReference) {
    FluxDispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
  }
  const cloudUpload = new CloudUpload(
    {
      file,
      isThumbnail: false,
      platform: 1,
    },
    channelId,
    false,
    0,
  );

  cloudUpload.durationSecs = durationSecs;
  cloudUpload.waveform = waveform;

  const messagePayload = {
    flags: 1 << 13,
    channel_id: channelId,
    content: "",
    sticker_ids: [],
    validNonShortcutEmojis: [],
    type: 0,
    message_reference: replyOptions?.messageReference || null,
    nonce: timestampToSnowflake(Date.now()),
  };

  const failed = (...args): void => {
    PluginLogger.error("Failed to upload voice message", ...args);
    Toast.toast("Failed to upload voice message", Toast.Kind.FAILURE);
    UltimateMessageStore.clearChannel(channelId);
  };

  cloudUpload.on("error", failed);

  if (cloudUpload.status !== "ERROR")
    void UltimateMessageStore.sendMessage(channelId, messagePayload, null, {
      // @ts-expect-error type required to be updated in replugged
      attachmentsToUpload: [cloudUpload],
      onAttachmentUploadError: failed,
      ...messagePayload,
    }).then(() => {
      if (cloudUpload._aborted)
        Toast.toast("Successfully uploaded voice message", Toast.Kind.SUCCESS);
    });
};

export const unmangleExports = <T>(
  moduleFilter: Types.DefaultTypes.Filter | Types.DefaultTypes.RawModule,
  map: Record<string, string | string[] | RegExp | Types.DefaultTypes.AnyFunction>,
): T => {
  const getExportKeyFinder = (
    mapValue: string | string[] | RegExp | Types.DefaultTypes.AnyFunction,
  ): Types.DefaultTypes.AnyFunction => {
    if (typeof mapValue === "function") {
      return (mod: Types.DefaultTypes.RawModule["exports"]) => {
        return mapValue(mod);
      };
    }

    if (Array.isArray(mapValue)) {
      return (mod: Types.DefaultTypes.RawModule["exports"]) => {
        if (!isObject(mod)) return "";
        for (const [k, exported] of Object.entries(mod)) {
          if (mapValue.every((p) => Object.hasOwnProperty.call(exported, p))) return k;
        }
      };
    }

    return (mod: Types.DefaultTypes.RawModule["exports"]) =>
      webpack.getFunctionKeyBySource(mod, mapValue as string);
  };

  const mod: Types.DefaultTypes.RawModule =
    typeof moduleFilter === "function"
      ? webpack.getModule(moduleFilter, { raw: true })
      : moduleFilter;

  if (!mod) return {} as T;

  const unmangled = {} as T;

  for (const key in map) {
    const findKey = getExportKeyFinder(map[key]);
    const valueKey = findKey(mod.exports) as string;
    Object.defineProperty(unmangled, key, {
      get: () => mod.exports[valueKey],
      set: (v) => {
        mod.exports[valueKey] = v;
      },
    });
  }

  return unmangled;
};

export default {
  ...util,
  getWaveForm,
  setLoopback,
  startRecording,
  stopRecording,
  sendVoiceMessage,
  timestampToSnowflake,
  unmangleExports,
};
