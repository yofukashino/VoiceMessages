import type { Message } from "discord-types/general";
import { webpack } from "replugged";
import type { CloudUpload } from "./CloudUpload";
import type { CloudUploaderBase } from "./CloudUploaderBase";
import type { UploaderBaseOptions } from "./UploaderBase";

interface CloudUploaderUploadOptions {
  addFilesTo?: string;
}

export declare class CloudUploader extends CloudUploaderBase {
  public constructor(url: string, method?: "POST" | "PATCH", options?: UploaderBaseOptions);

  private _createMessage: (
    abortSignal: AbortSignal,
    data: Record<string, unknown>,
    addFilesTo: string | undefined,
  ) => Promise<Message | Record<string, unknown> | void>;
  public uploadFiles: (
    files: CloudUpload[],
    data: Record<string, unknown>,
    options?: CloudUploaderUploadOptions,
  ) => Promise<Message | Record<string, unknown> | void>;
}

export default await webpack.waitForModule<typeof CloudUploader>(
  webpack.filters.bySource("this._addAttachmentsToPayload"),
);
