// author = shokkunn

import { Webhook } from "discord.js";
import StageClass from "../stages/Stage";
import ActorClass from "./Actor";

export default class ActorOnStageClass {
    private _actorClass: ActorClass;
    
    public stage: StageClass;
    public webhook: Webhook;

    constructor(actorClass: ActorClass, stageClass: StageClass, webhook: Webhook) {
        this._actorClass = actorClass;
        this.stage = stageClass;
        this.webhook = webhook;
    }

    get actorClass() {
        return this._actorClass;
    }
}