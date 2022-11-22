import IInvokerRegistry from "./IInvokerRegistry"
import ILogger from "./ILogger"
import IModuleTree from "./IModuleTree"

export default interface IModule {
    getName() : string
    getModuleTree() : IModuleTree<IModule>
    getRegistryInvoker() : IInvokerRegistry
    install() : void
    isInstalled() : boolean
    getState() : any
    getLogger() : ILogger
    setLogger(logger: ILogger) : void
}