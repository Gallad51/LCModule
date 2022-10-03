import IInvokerRegistry from "./IInvokerRegistry"
import ILogger from "./ILogger"
import ModuleTree from "./ModuleTree"

export default interface IModule {
    getName() : string
    getModuleTree() : ModuleTree
    getRegistryInvoker() : IInvokerRegistry
    install() : void
    isInstalled() : boolean
    getState() : any
    getLogger() : ILogger
    setLogger(logger: ILogger) : void
}