import Modules from "../lib/requiredModules";
import injectChannelAttachContextMenu from "./ChannelAttachContextMenu";
export const applyInjections = async (): Promise<void> => {
  await Modules.loadModules();

  injectChannelAttachContextMenu();
};

export default { applyInjections };
