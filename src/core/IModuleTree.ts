import ITree from "./ITree";

export default interface IModuleTree<T> extends ITree<T> {
    findDeepInnerModuleByName(name: string) : T | null
    findInnerModule(modulePath: Array<string>) : T | null
    getFullPath() : string
}