import IModule from "./IModules"
import ModuleMethodProperties from "./ModuleMethodProperties"

export default class ModuleMethod {
    _name: string
    _method: any
    _properties: ModuleMethodProperties | undefined
    _firstCalled: boolean = false

    constructor (name: string, method: any, properties?: ModuleMethodProperties) {
        this._name = name
        this._method = method
        this._properties = properties
    }

    callMethod(thisArg: IModule, param: any) : any {
        if (this.isCallable(thisArg.isInstalled())) {
            this._firstCalled = true
            return this._method.call(thisArg, param)
        } else {
            throw new Error(`Could not invoke the method ${this._name} for now. ${thisArg.isInstalled() ? 'Module should not be installed to be invoked.' : 'Module should be installed to be invoked.' }`)
        }
    }

    isCallable(installationStatus: boolean) {
        return installationStatus || this._properties?.installRequired || this._properties?.allowBeforeInstall
    }
}