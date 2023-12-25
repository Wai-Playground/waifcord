// author = shokkunn

/** Base class for DB data classes */

export default abstract class BaseDataClass {
    protected _id: string;
    protected _createdAt: Date | null;
    protected _updatedAt: Date | null;

    constructor(data: { id: string, createdAt: Date | null, updatedAt: Date | null }) {
        this._id = data.id;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    get id() {
        return this._id;
    }

    get createdAt() {
        return this._createdAt;
    }

    get updatedAt() {
        return this._updatedAt;
    }

    public toJSON() {
        return {
            id: this._id,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        }
    }
}