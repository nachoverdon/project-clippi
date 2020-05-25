import * as React from "react";

import { ActionTypeGenerator, Context } from "@vinceau/event-actions";
import { produce } from "immer";
import { Icon } from "semantic-ui-react";

import { DelayInput, NotifyInput, SimpleInput } from "@/components/InlineInputs";
import { notify as sendNotification } from "@/lib/utils";
import { dispatcher, store } from "@/store";
import { delay as waitMillis, parseSecondsDelayValue } from "common/utils";
import { createTwitchClip } from "../../lib/twitch";
import { ActionComponent } from "./types";

const DEFAULT_DELAY_SECONDS = 10;

interface ActionCreateTwitchClipParams {
    delaySeconds?: string;
    notify?: boolean;
    postToChat?: boolean;
    channel?: string;
}

const defaultParams = (): ActionCreateTwitchClipParams => {
    const user = store.getState().tempContainer.twitchUser;
    const channel = user ? user.name : "";
    return {
        delaySeconds: DEFAULT_DELAY_SECONDS.toString(),
        notify: false,
        postToChat: true,
        channel,
    };
};

const actionCreateClip: ActionTypeGenerator = (params: ActionCreateTwitchClipParams) => {
    return async (ctx: Context): Promise<Context> => {
        try {
            const seconds = parseSecondsDelayValue(DEFAULT_DELAY_SECONDS, params.delaySeconds);
            if (seconds > 0) {
                await waitMillis(seconds * 1000);
            }
            const clip = await createTwitchClip(params.channel, params.postToChat);
            dispatcher.twitch.addTwitchClip(clip);
            if (params.notify) {
                sendNotification(`Clipped ${clip.clipID}`, "Twitch clip created");
            }
            return {
                ...ctx,
                clipID: clip.clipID,
            };
        } catch (err) {
            console.error(err);
            // sendNotification(`Failed to clip. ${params.channel ? "Is " + params.channel : "Are you"} live?`);
            return ctx;
        }
    };
};

const ActionIcon = () => {
    return (
        <Icon name="twitch" size="large" />
    );
};

interface TwitchClipInputProps extends Record<string, any> {
    value: ActionCreateTwitchClipParams;
    onChange(value: ActionCreateTwitchClipParams): void;
}

const TwitchClipInput = (props: TwitchClipInputProps) => {
    const { value, onChange } = props;
    const [channel, setChannel] = React.useState<string>(value.channel || "");
    const onDelayChange = (delay?: string) => {
        const newValue = produce(value, (draft) => {
            draft.delaySeconds = delay;
        });
        onChange(newValue);
    };
    const onNotifyChange = (notify?: boolean) => {
        const newValue = produce(value, (draft) => {
            draft.notify = notify;
        });
        onChange(newValue);
    };
    const onChannelChange = () => {
        const newValue = produce(value, (draft) => {
            draft.channel = channel;
        });
        onChange(newValue);
    };
    return (
        <div>
            <div>
                {"Clip the "}
                <SimpleInput
                    style={{ width: "100px" }}
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    onBlur={onChannelChange}
                />
                {" channel after a "}
                <DelayInput value={value.delaySeconds} onChange={onDelayChange} placeholder={`${DEFAULT_DELAY_SECONDS}`} />
                {" second delay and "}
                <NotifyInput value={value.notify} onChange={onNotifyChange} />
                {" me about it"}
            </div>
        </div>
    );
};

export const ActionTwitchClip: ActionComponent = {
    label: "create a Twitch clip",
    action: actionCreateClip,
    Icon: ActionIcon,
    Component: TwitchClipInput,
    defaultParams,
};
