// author = shokkunn

export default abstract class AbstractDataClass {
    private _id: string;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(data: { id: string, createdAt: Date, updatedAt: Date }) {
        this._id = data.id;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    get createdAt() {
        return this._createdAt;
    }

    get updatedAt() {
        return this._updatedAt;
    }

    get id() {
        return this._id;
    }
}