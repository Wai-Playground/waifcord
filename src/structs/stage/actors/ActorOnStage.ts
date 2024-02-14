// author = shokkunn

import { Collection, User, Webhook } from "discord.js";
import StageClass from "../stages/Stage";
import ActorClass, { ActorType } from "./Actor";
import { RelationshipsCol } from "../../../utils/services/Mango";
import RelationshipClass from "../relationships/Model";

export default class ActorOnStageClass {
    private _actorClass: ActorClass;
    
    public stage: StageClass;
    public webhook: Webhook;
    public relationships: Collection<string, RelationshipClass> = new Collection();

    constructor(data: ActorType, stageClass: StageClass, webhook: Webhook) {
        this._actorClass = new ActorClass(data);
        this.stage = stageClass;
        this.webhook = webhook;
    }

    get id() {
        return this._actorClass.id;
    }

    get actorClass() {
        return this._actorClass;
    }

    async getCompletions() {
    }
}