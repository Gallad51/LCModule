import IInvokerRegistry from "./IInvokerRegistry";
import IModule from "./IModules";
import ModuleMethod from "./ModuleMethod";
import ModuleMethodProperties from "./ModuleMethodProperties";

export default class ModuleInvokerRegistry implements IInvokerRegistry {
    _methods: Array<ModuleMethod>
    _module: IModule

    constructor(module: IModule) {
        this._methods = []
        this._module = module
    }

    register(methodName: string, method: any, properties?: ModuleMethodProperties) : void {
        this._methods.push(new ModuleMethod(methodName, method, properties))
    }

    getMethod(methodName: string) : ModuleMethod | undefined {
        return this._methods.find((method: ModuleMethod) => method._name === methodName )
    }

    async invoke(methodPath: string, param?: any | undefined) : Promise<any> {
        const splittedPath = methodPath.split(':')
        if (splittedPath.length > 1) {
            let expectedModule = this._module.getModuleTree().getRootModule().getModuleTree().findInnerModule(splittedPath.slice(0, -1))
            if (!expectedModule) {
                console.log('Module not found directly, fallback to basic search')
                expectedModule = this._module.getModuleTree().getRootModule().getModuleTree().findDeepInnerModuleByName(splittedPath.slice(-2, -1)[0])
            }
            
            if (expectedModule) {
                const method = expectedModule.getRegistryInvoker().getMethod(splittedPath[splittedPath.length -1])
                if (method) {
                    return method.callMethod(expectedModule, param)
                } else {
                    console.log('Invoking a non existing method')
                }
            } else {
                console.log('Invoking a non existing module')
            }
        } else {
            const method = this.getMethod(methodPath)
            if (method) {
                return method.callMethod(this._module, param)
            } else {
                console.log('Invoking a non existing method')
            }
        }
    }

    async invokeWithFormatter(methodPath: string, formatter: any, param?: any | undefined) : Promise<any> {
        if (formatter) {
            return formatter(await this.invoke(methodPath, param))
        } else {
            return this.invoke(methodPath, param)
        }
    }

    checkRequirements(): boolean {
        const missingDependency = this._methods.find((method: ModuleMethod) => method._properties?.installRequired && !method._firstCalled)
        if (missingDependency) {
            throw new Error(`Installation of module ${this._module.getName()} can not be made. Missing invoke to ${missingDependency._name}`)
        }
        return true
    }
}