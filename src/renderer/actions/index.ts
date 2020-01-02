import { EventActionConfig } from "@/components/Automator/Automator";
import { EventManager } from "@vinceau/event-actions";

import { ActionNotify } from "./ActionNotify";
import { ActionPlaySound } from "./ActionPlaySound";
import { ActionTwitchClip } from "./ActionTwitchClip";
import { ActionComponent } from "./types";

export enum Action {
    CREATE_TWITCH_CLIP = "twitch-clip",
    PLAY_SOUND = "play-sound",
    NOTIFY = "notify",
}

export const eventActionManager = new EventManager();

export const updateEventActionManager = (actions: EventActionConfig[]) => {
    const mapping: any = {};
    for (const a of actions)  {
        mapping[a.event] = a.actions;
    }
    eventActionManager.eventActions = mapping;
};

export const actionComponents: { [name: string]: ActionComponent} = {
    [Action.CREATE_TWITCH_CLIP]: ActionTwitchClip,
    [Action.NOTIFY]: ActionNotify,
    [Action.PLAY_SOUND]: ActionPlaySound,
};

for (const [key, value] of Object.entries(actionComponents)) {
    eventActionManager.registerAction(key, value.action);
}