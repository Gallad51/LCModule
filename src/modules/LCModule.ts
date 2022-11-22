import IInvokerRegistry from "../core/IInvokerRegistry"
import ILogger from "../core/ILogger"
import IModule from "../core/IModules"
import IModuleTree from "../core/IModuleTree"
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
    _tree: IModuleTree<IModule>
    _registryInvoker: IInvokerRegistry
    _isInstalled: boolean = false
    _state: any
    _logger: ILogger | undefined

    constructor(name: string, components?: {
        tree?: IModuleTree<IModule>,
        registryInvoker?: IInvokerRegistry
    }) {
        this._moduleName = name
        this._tree = components?.tree || new ModuleTree()
        this._registryInvoker = components?.registryInvoker || new ModuleInvokerRegistry(this)
        this._state = {}

        this.getModuleTree().setCurrentModule(this)
    }

    getLogger(): ILogger {
        return this._logger || defaultLogger
    }

    setLogger(logger: ILogger) {
        this._logger = logger
        this.getModuleTree().getInnerModules().forEach((innerMod: IModule) => {
            innerMod.setLogger(logger)
        })
    }

    getRegistryInvoker(): IInvokerRegistry {
        return this._registryInvoker
    }

    getName() : string {
        return this._moduleName
    }

    getModuleTree() : IModuleTree<IModule> {
        return this._tree
    }

    install() : void {
        this.getLogger().info(`Installing module ${this.getName()}`)
        this._registryInvoker.checkRequirements()
        this.getModuleTree().getInnerModules().forEach((innerMod: IModule) => {
            innerMod.install()
        })
        this._isInstalled = true
    }

    isInstalled() : boolean {
        return this._isInstalled
    }

    getState() : any {
        return this._state
    }
}