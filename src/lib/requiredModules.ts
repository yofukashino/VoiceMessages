import { webpack } from "replugged";
import Utils from "./utils";
import Types from "../types";

export const Modules: Types.Modules = {};

Modules.loadModules = async (): Promise<void> => {
  Modules.FileInput = await webpack
    .waitForModule<
      typeof Types.FileInput
    >(webpack.filters.bySource("_ref.activateUploadDialogue"), { timeout: 10000 })
    .catch(() => {
      throw new Error("Failed To Find FileInput Module");
    });
  Modules.SizeParser = await webpack
    .waitForModule<Types.DefaultTypes.RawModule>(webpack.filters.bySource("showDecimalForGB:!0"), {
      timeout: 10000,
      raw: true,
    })
    .then((v) =>
      Utils.unmangleExports<Types.SizeParser>(v, {
        formatSize: "showDecimalForGB",
      }),
    )
    .catch(() => {
      throw new Error("Failed To Find MessageRecordUtils Module");
    });
  Modules.FileSizeLimits = await webpack
    .waitForModule<Types.DefaultTypes.RawModule>(
      webpack.filters.bySource("premiumType].fileSize"),
      {
        timeout: 10000,
        raw: true,
      },
    )
    .then((v) =>
      Utils.unmangleExports<Types.FileSizeLimits>(v, {
        getUserLimit: "premiumType].fileSize",
      }),
    )
    .catch(() => {
      throw new Error("Failed To Find MessageRecordUtils Module");
    });

  Modules.VoiceMessage = await webpack
    .waitForModule<Types.VoiceMessage>(webpack.filters.bySource(".waveform,waveform"), {
      timeout: 10000,
    })
    .catch(() => {
      throw new Error("Failed To Find VoiceMessage Module");
    });
  Modules.CloudUpload = await webpack
    .waitForModule(webpack.filters.bySource("uploadFileToCloud"), {
      timeout: 10000,
    })
    .then((mod) => webpack.getFunctionBySource<Types.CloudUpload>(mod, "uploadFileToCloud"))
    .catch(() => {
      throw new Error("Failed To Find CloudUpload Module");
    });

  Modules.PermissionUtils ??= await webpack
    .waitForModule<Types.DefaultTypes.RawModule>(
      webpack.filters.bySource(".computeLurkerPermissionsAllowList()"),
      { timeout: 10000, raw: true },
    )
    .then((v) =>
      Utils.unmangleExports<Types.PermissionUtils>(v, {
        can: "excludeGuildPermissions:",
        getGuildVisualOwnerId: ".ownerId",
        getHighestHoistedRole: ".hoistRoleId?",
        getHighestRole: ".position).first()",
        isRoleHigher: /\w+\.indexOf\(\w+\.id\)>/,
      }),
    )
    .catch(() => {
      throw new Error("Failed To Find PermissionUtils Module");
    });
  Modules.PendingReplyStore = webpack.getByStoreName<Types.PendingReplyStore>("PendingReplyStore")!;
  Modules.MediaEngineStore ??= webpack.getByStoreName<Types.MediaEngineStore>("MediaEngineStore");
};

export default Modules;
