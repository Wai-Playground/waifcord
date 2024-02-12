// author = shokkunn

import { Collection, Webhook } from "discord.js";
import StageClass from "../stages/Stage";
import ActorClass from "./Actor";
import { RelationshipsCol } from "../../../utils/services/Mango";
import RelationshipClass from "../relationships/Model";

export default class ActorOnStageClass {
    private _actorClass: ActorClass;
    
    public stage: StageClass;
    public webhook?: Webhook;
    public relationships: Collection<string, RelationshipClass> = new Collection();

    constructor(actorClass: ActorClass, stageClass: StageClass, webhook?: Webhook) {
        this._actorClass = actorClass;
        this.stage = stageClass;
        this.webhook = webhook;
    }

    get id() {
        return this._actorClass.id;
    }

    get actorClass() {
        return this._actorClass;
    }
}