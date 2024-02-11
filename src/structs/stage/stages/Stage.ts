// author = shokkunn

import ActorOnStageClass from "../actors/ActorOnStage";
import UserClass from "../users/User";

export default class StageClass {
    private _id: string;

    constructor(id: string) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    
}

/** Types */

export interface StageEvents {
    userJoin: [user: UserClass],
    userLeave: [user: UserClass],
    actorJoin: [actor: ActorOnStageClass],
    actorLeave: [actor: ActorOnStageClass],
    stageEnd: [stage: StageClass],
    stageCreate: [stage: StageClass],
    messageCreate: [message: string],

}