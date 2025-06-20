import { types } from "replugged";
import type {
  ChannelMessages as ChannelMessagesType,
  SendMessageForReplyOptions,
  SendMessageOptionsForReply as SendMessageOptionsForReplyType,
} from "replugged/dist/renderer/modules/common/messages";
import type { ContextMenuType } from "replugged/dist/renderer/modules/components/ContextMenu";
import type { Store } from "replugged/dist/renderer/modules/common/flux";
import type util from "replugged/util";
import type GeneralDiscordTypes from "discord-types/general";
import type React from "react";
import type { CloudUpload as CloudUploadType } from "./uploaderTypes-fede/CloudUpload";

export namespace Types {
  export import DefaultTypes = types;
  export type Guild = GeneralDiscordTypes.Guild;
  export type Channel = GeneralDiscordTypes.Channel;
  export type User = GeneralDiscordTypes.User;
  export type Message = GeneralDiscordTypes.Message;
  export type UtilTree = util.Tree;
  export type ReactTree = util.Tree & React.ReactElement;
  export type ChannelMessages = typeof ChannelMessagesType;
  export type CloudUpload = typeof CloudUploadType;
  export type SendMessageOptionsForReply = SendMessageOptionsForReplyType;
  export type MenuProps = React.ComponentProps<ContextMenuType["ContextMenu"]> & {
    children: React.ReactElement[];
  };

  export type Jsonifiable =
    | null
    | undefined
    | boolean
    | number
    | string
    | Jsonifiable[]
    | { [key: string]: Jsonifiable };
  export type ValType<T> =
    | T
    | React.ChangeEvent<HTMLInputElement>
    | (Record<string, unknown> & { value?: T; checked?: T });

  export type NestedType<T, P> = P extends `${infer Left}.${infer Right}`
    ? Left extends keyof T
      ? NestedType<T[Left], Right>
      : Left extends `${infer FieldKey}[${infer IndexKey}]`
        ? FieldKey extends keyof T
          ? NestedType<Exclude<T[FieldKey], undefined> extends infer U ? U : never, IndexKey>
          : undefined
        : undefined
    : P extends keyof T
      ? T[P]
      : P extends `${infer FieldKey}`
        ? FieldKey extends keyof T
          ? Exclude<T[FieldKey], undefined> extends infer U
            ? U
            : never
          : undefined
        : undefined;

  export interface MediaEngineStore extends Store {
    getAecDump: DefaultTypes.AnyFunction;
    getAttenuateWhileSpeakingOthers: DefaultTypes.AnyFunction;
    getAttenuateWhileSpeakingSelf: DefaultTypes.AnyFunction;
    getAttenuation: DefaultTypes.AnyFunction;
    getAudioSubsystem: DefaultTypes.AnyFunction;
    getAutomaticGainControl: DefaultTypes.AnyFunction;
    getAv1Enabled: DefaultTypes.AnyFunction;
    getCameraComponent: DefaultTypes.AnyFunction;
    getDebugLogging: DefaultTypes.AnyFunction;
    getEchoCancellation: DefaultTypes.AnyFunction;
    getEnableSilenceWarning: DefaultTypes.AnyFunction;
    getEverSpeakingWhileMuted: DefaultTypes.AnyFunction;
    getExperimentalEncoders: DefaultTypes.AnyFunction;
    getExperimentalSoundshare: DefaultTypes.AnyFunction;
    getGoLiveContext: DefaultTypes.AnyFunction;
    getGoLiveSource: DefaultTypes.AnyFunction;
    getH265Enabled: DefaultTypes.AnyFunction;
    getHardwareH264: DefaultTypes.AnyFunction;
    getInputDetected: DefaultTypes.AnyFunction;
    getInputDeviceId: DefaultTypes.AnyFunction;
    getInputDevices: DefaultTypes.AnyFunction;
    getInputVolume: DefaultTypes.AnyFunction;
    getLocalPan: DefaultTypes.AnyFunction;
    getLocalVolume: DefaultTypes.AnyFunction;
    getLoopback: DefaultTypes.AnyFunction;
    getMediaEngine: () => {
      startRecordingRawSamples: (
        cb: (samples: Uint16Array, numOfChannels: number, sampleRate: number) => void,
      ) => void;
      stopRecordingRawSamples: () => void;
    };
    getMode: DefaultTypes.AnyFunction;
    getModeOptions: DefaultTypes.AnyFunction;
    getNoInputDetectedNotice: DefaultTypes.AnyFunction;
    getNoiseCancellation: DefaultTypes.AnyFunction;
    getNoiseSuppression: DefaultTypes.AnyFunction;
    getOpenH264: DefaultTypes.AnyFunction;
    getOutputDeviceId: DefaultTypes.AnyFunction;
    getOutputDevices: DefaultTypes.AnyFunction;
    getOutputVolume: () => number;
    getPacketDelay: DefaultTypes.AnyFunction;
    getQoS: DefaultTypes.AnyFunction;
    getSettings: DefaultTypes.AnyFunction;
    getShortcuts: DefaultTypes.AnyFunction;
    getSoundshareEnabled: DefaultTypes.AnyFunction;
    getState: DefaultTypes.AnyFunction;
    getSupportedSecureFramesProtocolVersion: DefaultTypes.AnyFunction;
    getVideoComponent: DefaultTypes.AnyFunction;
    getVideoDeviceId: DefaultTypes.AnyFunction;
    getVideoDevices: DefaultTypes.AnyFunction;
    getVideoHook: DefaultTypes.AnyFunction;
    getVideoStreamParameters: DefaultTypes.AnyFunction;
    getVideoToggleState: DefaultTypes.AnyFunction;
    hasContext: DefaultTypes.AnyFunction;
    initialize: DefaultTypes.AnyFunction;
    isAdvancedVoiceActivitySupported: DefaultTypes.AnyFunction;
    isAecDumpSupported: DefaultTypes.AnyFunction;
    isAnyLocalVideoAutoDisabled: DefaultTypes.AnyFunction;
    isAutomaticGainControlSupported: DefaultTypes.AnyFunction;
    isDeaf: DefaultTypes.AnyFunction;
    isEnabled: DefaultTypes.AnyFunction;
    isExperimentalEncodersSupported: DefaultTypes.AnyFunction;
    isHardwareMute: DefaultTypes.AnyFunction;
    isInteractionRequired: DefaultTypes.AnyFunction;
    isLocalMute: DefaultTypes.AnyFunction;
    isLocalVideoAutoDisabled: DefaultTypes.AnyFunction;
    isLocalVideoDisabled: DefaultTypes.AnyFunction;
    isMediaFilterSettingLoading: DefaultTypes.AnyFunction;
    isMute: DefaultTypes.AnyFunction;
    isNativeAudioPermissionReady: DefaultTypes.AnyFunction;
    isNoiseCancellationError: DefaultTypes.AnyFunction;
    isNoiseCancellationSupported: DefaultTypes.AnyFunction;
    isNoiseSuppressionSupported: DefaultTypes.AnyFunction;
    isScreenSharing: DefaultTypes.AnyFunction;
    isSelfDeaf: DefaultTypes.AnyFunction;
    isSelfMute: DefaultTypes.AnyFunction;
    isSelfMutedTemporarily: DefaultTypes.AnyFunction;
    isSimulcastSupported: DefaultTypes.AnyFunction;
    isSoundSharing: DefaultTypes.AnyFunction;
    isSupported: DefaultTypes.AnyFunction;
    isVideoAvailable: DefaultTypes.AnyFunction;
    isVideoEnabled: DefaultTypes.AnyFunction;
    setCanHavePriority: DefaultTypes.AnyFunction;
    supports: DefaultTypes.AnyFunction;
    supportsDisableLocalVideo: DefaultTypes.AnyFunction;
    supportsEnableSoundshare: DefaultTypes.AnyFunction;
    supportsExperimentalSoundshare: DefaultTypes.AnyFunction;
    supportsInApp: DefaultTypes.AnyFunction;
    supportsScreenSoundshare: DefaultTypes.AnyFunction;
    supportsVideoHook: DefaultTypes.AnyFunction;
  }
  /* ================================*/
  // These Types from https://github.com/fedeericodl/EditMessageAttachments/blob/adfc23635cb49b75eb7e2c0bae3d3e2ad054a31b/src/components/webpack/FileInput.tsx#L29

  interface CommonFileInputProps {
    "aria-hidden"?: boolean;
    "aria-label"?: string;
    className?: string;
    disabled?: boolean;
    embedded?: boolean;
    filters?: Array<{ extensions: string[] }>;
    handleNativeClick?: (props: FileInputProps) => void;
    multiple?: boolean;
    name?: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    tabIndex?: number;
  }

  export declare class CommonFileInput extends React.Component<CommonFileInputProps> {
    private _input: HTMLInputElement | null;

    public activateUploadDialogue: () => void;
    public handleBrowserInputMouseDown: React.MouseEventHandler<HTMLInputElement>;
    public handleNativeClick: () => void;
    public handleNativeKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  }

  interface FileInputProps extends CommonFileInputProps {}

  export declare class FileInput extends React.Component<CommonFileInputProps> {
    private _ref: React.RefObject<CommonFileInput> | null;

    public activateUploadDialogue: () => void;
    public setRef: (ref: CommonFileInput | null) => void;
  }
  /* ================================*/

  export type VoiceMessage = React.FC<{
    src: string;
    waveform: string;
    item: { downloadUrl: string };
    fileName: string;
  }>;

  export interface PendingReplyStore extends Store {
    getPendingReply: (channelId: string) => SendMessageForReplyOptions;
  }

  export interface MessageRecordUtils {
    createMessageRecord: (partialMessage: Record<string, unknown>) => Message;
  }

  export interface SizeParser {
    formatSize: (
      MegaBit: number,
      options?: {
        useKibibytes: boolean;
      },
    ) => string;
  }

  export interface FileSizeLimits {
    getUserLimit: () => number;
  }

  export interface PermissionUtils {
    applyThreadPermissions?: DefaultTypes.AnyFunction;
    areChannelsLocked?: DefaultTypes.AnyFunction;
    can: DefaultTypes.AnyFunction;
    canEveryone?: DefaultTypes.AnyFunction;
    canEveryoneRole?: DefaultTypes.AnyFunction;
    canManageACategory?: DefaultTypes.AnyFunction;
    computePermissions?: DefaultTypes.AnyFunction;
    computePermissionsForRoles?: DefaultTypes.AnyFunction;
    getGuildVisualOwnerId?: DefaultTypes.AnyFunction;
    getHighestHoistedRole?: DefaultTypes.AnyFunction;
    getHighestRole?: DefaultTypes.AnyFunction;
    isRoleHigher?: DefaultTypes.AnyFunction;
    makeEveryoneOverwrite?: DefaultTypes.AnyFunction;
  }

  export interface Modules {
    loadModules?: () => Promise<void>;
    FileInput?: typeof FileInput;
    VoiceMessage?: VoiceMessage;
    FileSizeLimits?: FileSizeLimits;
    CloudUpload?: CloudUpload;
    SizeParser?: SizeParser;
    PermissionUtils?: PermissionUtils;
    PendingReplyStore?: PendingReplyStore;
    MediaEngineStore?: MediaEngineStore;
  }
}
export default Types;
