import {
  constants as DiscordConstants,
  modal as ModalActions,
  users as UltimateUserStore,
} from "replugged/common";
import { ContextMenu } from "replugged/components";
import { PluginInjectorUtils } from "../index";
import Modules from "../lib/requiredModules";
import RecordModal from "../Components/RecordModal";
import Types from "../types";
import Icons from "../Components/Icons";

export default (): void => {
  PluginInjectorUtils.addMenuItem(
    Types.DefaultTypes.ContextMenuTypes.ChannelAttach,
    ({ channel }: { channel: Types.Channel }, menu: Types.MenuProps): React.ReactElement | void => {
      const { PermissionUtils } = Modules;
      const user = UltimateUserStore.getCurrentUser();
      if (
        channel.getGuildId() &&
        !PermissionUtils.can({
          permission: DiscordConstants.Permissions.SEND_MESSAGES,
          context: channel,
          user,
        }) &&
        !PermissionUtils.can({
          permission: DiscordConstants.Permissions.SEND_VOICE_MESSAGES,
          context: channel,
          user,
        })
      )
        return;

      menu.children.push(
        <ContextMenu.MenuItem
          id="record-voice-message"
          label="Record Voice Message"
          iconLeft={Icons.mic}
          action={() =>
            ModalActions.openModal((props) => <RecordModal {...props} channel={channel} />)
          }
        />,
      );
    },
  );
};
