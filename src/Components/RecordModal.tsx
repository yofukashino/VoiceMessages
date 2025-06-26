import { React, toast as Toast, channels as UltimateChannelStore } from "replugged/common";
import { Button, Clickable, ErrorBoundary, Flex, Modal, Notice, Text } from "replugged/components";
import { extensions } from "../lib/consts";
import Modules from "../lib/requiredModules";
import Utils from "../lib/utils";
import Types from "../types";

export default React.memo((props: { onClose: () => void; channel: Types.Channel }) => {
  const { FileInput, VoiceMessage, FileSizeLimits, SizeParser } = Modules;
  const {
    onClose,
    channel: { id: channelId },
  } = props;

  const SizeLimit = React.useMemo(() => FileSizeLimits.getUserLimit(), []);
  const VoiceChatting = React.useMemo(() => UltimateChannelStore.getVoiceChannelId(), []);
  const FileInputRef = React.useRef<Types.FileInput | null>();
  const [isRecording, setRecording] = React.useState<boolean>(false);
  const [isPaused, setPaused] = React.useState<boolean>(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [waveform, setWaveform] = React.useState<string>(null);
  const [durationSecs, setDurationSecs] = React.useState<number>(null);
  const [blobUrl, setBlobUrl] = React.useState<string>();
  const FileBufferRef = React.useRef<ArrayBuffer | null>();
  React.useEffect(() => {
    const makePreview = async () => {
      if (!file) {
        FileBufferRef.current = null;
        return;
      }
      FileBufferRef.current = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const fileArrayBuffer = await file.arrayBuffer();
      setBlobUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return URL.createObjectURL(file);
      });
      const data = await audioContext.decodeAudioData(fileArrayBuffer);
      setDurationSecs(data.duration);
      setWaveform(() => Utils.getWaveForm(data));
    };
    makePreview();
  }, [file]);

  React.useEffect(() => {
    if (isPaused) setRecording(true);
  }, [isPaused, isRecording]);

  const [dragHover, setDragHover] = React.useState(false);
  const dndRef = React.useRef<HTMLDivElement | null>(null);

  const handleDragOver = (): void => {
    setDragHover(true);
  };

  const handleDragLeave = (): void => {
    setDragHover(false);
  };

  const handleDrop = React.useCallback(
    (event: DragEvent) => {
      handleDragLeave();
      if (event.dataTransfer.files.length > 1) {
        Toast.toast("Can't process multiple files. Add one image at a time.", Toast.Kind.FAILURE);
        return;
      }
      if (
        ![...extensions, "audio/mpeg"].some((e) => event.dataTransfer.files[0].type.includes(e))
      ) {
        Toast.toast("Unsupported Format.", Toast.Kind.FAILURE);
        return;
      }
      if (event.dataTransfer) setFile(event.dataTransfer.files[0]);
    },
    [setFile],
  );

  React.useEffect(() => {
    const { current } = dndRef;
    if (!current) return () => {};

    current.addEventListener("dragover", handleDragOver, false);
    current.addEventListener("dragleave", handleDragLeave, false);
    current.addEventListener("drop", handleDrop, false);

    return () => {
      const { current } = dndRef;
      if (!current) return;

      current.removeEventListener("dragover", handleDragOver, false);
      current.removeEventListener("dragleave", handleDragLeave, false);
      current.removeEventListener("drop", handleDrop, false);
    };
  }, [handleDrop]);

  return (
    <Modal.ModalRoot className={`vmm-modal ${dragHover && "vmm-dragging"}`} size="large" {...props}>
      <span ref={dndRef}>
        <Modal.ModalHeader className="vmm-header">
          <Text.H2
            style={{
              marginTop: 10,
            }}>
            Voice Message Recorder
          </Text.H2>
        </Modal.ModalHeader>
        <Modal.ModalContent>
          <ErrorBoundary>
            <Flex
              className="vmm-content"
              justify={Flex.Justify.BETWEEN}
              direction={Flex.Direction.VERTICAL}>
              <span className="vmm-content-preview">
                <Flex
                  className="vmm-content-buttons"
                  key={`${isPaused ? "paused" : "lost-pause"} ${isRecording ? "recording" : "not-recording"}`}>
                  {!file && !isRecording && (
                    <Button color={Button.Colors.BRAND} look={Button.Looks.OUTLINED}>
                      <FileInput
                        ref={FileInputRef}
                        onChange={(event) => {
                          setFile(event.currentTarget.files[0]);
                          event.currentTarget.value = "";
                        }}
                        disabled={Boolean(isRecording || file)}
                        multiple={false}
                        filters={[
                          {
                            extensions,
                          },
                        ]}
                      />
                      Upload Recording
                    </Button>
                  )}
                  {isRecording && (
                    <Button
                      look={Button.Looks.OUTLINED}
                      color={isPaused ? Button.Colors.PRIMARY : Button.Colors.RED}
                      onClick={() => {
                        if (!isPaused) {
                          setPaused(() => true);
                          Utils.stopRecording();
                          return;
                        }
                        Utils.startRecording(
                          `voice-message-${Date.now()}`,
                          (file) => {
                            setFile(file);
                            setRecording(() => false);
                          },
                          FileBufferRef.current,
                        );
                        setPaused(() => false);
                      }}>
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                  )}
                  {(!file || isRecording || isPaused) && (
                    <Button
                      look={Button.Looks.OUTLINED}
                      color={isRecording ? Button.Colors.RED : Button.Colors.BRAND}
                      onClick={() => {
                        if (isPaused) {
                          setPaused(() => false);
                          setRecording(() => false);
                          return;
                        }
                        if (isRecording) {
                          Utils.stopRecording();
                          return;
                        }
                        Utils.startRecording(`voice-message-${Date.now()}`, (file) => {
                          setFile(file);
                          setRecording(() => false);
                        });
                        setRecording(() => true);
                      }}>
                      {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>
                  )}
                  {file && !isPaused && !isRecording && (
                    <Button
                      look={Button.Looks.OUTLINED}
                      color={Button.Colors.RED}
                      onClick={() => setFile(null)}>
                      Clear Recording
                    </Button>
                  )}
                </Flex>
                {file ? (
                  <Flex direction={Flex.Direction.VERTICAL} className="vmm-content-waumpus">
                    <img
                      src="/assets/99c37d0072d3b000.svg"
                      className="vmm-voice-message vmm-content-waumpus-img"
                    />
                    <span style={{ width: "100%" }}>
                      <VoiceMessage
                        key={blobUrl}
                        src={blobUrl}
                        waveform={waveform}
                        item={{ downloadUrl: blobUrl }}
                        fileName={file.name}
                      />
                    </span>
                  </Flex>
                ) : (
                  <Flex direction={Flex.Direction.VERTICAL} className="vmm-content-waumpus">
                    <img
                      src={
                        isRecording
                          ? "/assets/b584f76d3ff86700.svg"
                          : "/assets/532f1d4582d881960783.svg"
                      }
                      className="vmm-content-waumpus-img"
                    />
                    <Text.Normal className="vmm-content-waumpus-text">
                      {isRecording
                        ? "Wampus heard a sexy voice..."
                        : "Waumpus waiting for your recording..."}
                    </Text.Normal>
                  </Flex>
                )}
              </span>
              {VoiceChatting && (
                <Notice messageType={Notice.HelpMessageTypes.WARNING}>
                  You might not be able to hear others in voice chat while recording, but they will
                  still be able to hear you if you're using voice activity or holding your PTT key.
                </Notice>
              )}
              {file && file.size > SizeLimit && (
                <Notice messageType={Notice.HelpMessageTypes.ERROR}>
                  <Flex style={{ gap: "6px" }}>
                    The max file size is
                    {SizeParser.formatSize(SizeLimit / 1024, {
                      useKibibytes: true,
                    })}
                    . You Can Upgrade to Discord Nitro to upload larger files.
                    <Clickable
                      className="vmm-learn-more"
                      onClick={() => open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
                      Learn More
                    </Clickable>
                  </Flex>
                </Notice>
              )}
            </Flex>
          </ErrorBoundary>
        </Modal.ModalContent>
        <Modal.ModalFooter className="vmm-footer">
          <Button color={Button.Colors.TRANSPARENT} className="vmm-cancel" onClick={onClose}>
            Cancel
          </Button>
          {file && (
            <Button
              color={file && file.size > SizeLimit ? Button.Colors.RED : Button.Colors.GREEN}
              look={Button.Looks.OUTLINED}
              disabled={file && file.size > SizeLimit}
              onClick={() => {
                Utils.sendVoiceMessage({ file, waveform, durationSecs, channelId });
                onClose();
              }}>
              Send
            </Button>
          )}
        </Modal.ModalFooter>
      </span>
    </Modal.ModalRoot>
  );
});
