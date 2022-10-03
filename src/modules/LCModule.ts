import IInvokerRegistry from "../core/IInvokerRegistry"
import ILogger from "../core/ILogger"
import IModule from "../core/IModules"
import ModuleInvokerRegistry from "../core/ModuleInvokerRegistry"
import ModuleTree from "../core/ModuleTree"

const defaultLogger: ILogger = {
    info: (message: string, data?: any) => { console.log(message) },
    debug: (message: string, data?: any) => { console.log(message) },
    warn: (message: string, data?: any) => { console.log(message) },
    error: (message: string, data?: any) => { console.log(message) },
    crit: (message: string, data?: any) => { console.log(message) }
}

export default class LCModule implements IModule {
    _moduleName: string
    _tree: ModuleTree
    _registryInvoker: IInvokerRegistry
    _isInstalled: boolean = false
    _state: any
    _logger: ILogger | undefined

    constructor(name: string) {
        this._moduleName = name
        this._tree = new ModuleTree(this)
        this._registryInvoker = new ModuleInvokerRegistry(this)
        this._state = {}
    }

    getLogger(): ILogger {
        return this._logger || defaultLogger
    }

    setLogger(logger: ILogger) {
        this._logger = logger
    }

    getRegistryInvoker(): IInvokerRegistry {
        return this._registryInvoker
    }

    getName() : string {
        return this._moduleName
    }

    getModuleTree() : ModuleTree {
        return this._tree
    }

    install() : void {
        this._isInstalled = true
        this._registryInvoker.checkRequirements()
        this.getModuleTree().getInnerModules().forEach((innerMod: IModule) => {
            innerMod.install()
        })
    }

    isInstalled() : boolean {
        return this._isInstalled
    }

    getState() : any {
        return this._state
    }
}