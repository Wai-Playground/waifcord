// author = shokkunn

import { Message, User } from "discord.js";
import { EventEmitter} from "events";
import { v4 as generateUUID } from "uuid";

export default class BaseStage extends EventEmitter {
    protected _participants: Map<string, any> = new Map();
    private _stageId: string;
    protected _context: Message<boolean>;
    constructor(context: Message<boolean>) {
        super();
        this._context = context; 
        this._stageId = generateUUID();
    }

    get startedBy(): User {
        return this._context.author;
    }

    get stageId(): string {
        return this._stageId;
    }

    
    
    
}