export default interface ITree<T> {
    setCurrentModule(node: T): void
    getParentModule() : T | undefined
    setParentModule(parentNode: T) : void
    getInnerModules() : Array<T>
    addInnerModule(node: T) : void
    getRootModule() : T
}