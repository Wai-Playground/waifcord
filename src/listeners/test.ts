// author = shokkunn

import BaseModule from "../base/BaseModule";

export default class TestModule extends BaseModule {
    constructor() {
        super("test");
    }

    public test() {
        console.log("test");
    }
}