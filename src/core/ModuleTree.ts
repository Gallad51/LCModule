import IModule from "./IModules";
import ITree from "./ITree";

export default class ModuleTree implements ITree<IModule> {
    _innerModules : Array<IModule>
    _module : IModule
    _parentModule : IModule | undefined
    _fullPath : string
    
    constructor(mod: IModule) {
        this._module = mod
        this._innerModules = []
        this._fullPath = mod.getName()
    }
    
    getParentModule(): IModule | undefined {
        return this._parentModule
    }

    setParentModule(parentNode: IModule): void {
        this._parentModule = parentNode
        this._fullPath = this._module.getName()
        let parent: IModule | undefined = this._module
        while (parent?.getModuleTree().getParentModule()) {
            parent = parent.getModuleTree().getParentModule()
            if (parent) {
                this._fullPath = [parent.getName(), this._fullPath].join(':')
            }
        }
    }

    getInnerModules(): IModule[] {
        return this._innerModules
    }

    addInnerModule(node: IModule): void {
        if (!this._module.isInstalled()) {
            node.getModuleTree().setParentModule(this._module)
            this._innerModules.push(node)
        } else {
            throw new Error('Could not alterate Module Tree after installation')
        }
    }

    getRootModule() : IModule {
        let current: IModule | undefined = this._module
        while (current.getModuleTree().getParentModule()) {
            const parent = current.getModuleTree().getParentModule()
            if (parent) {
                current = parent
            }
        }
        return current
    }

    getFullPath() {
        return this._fullPath
    }

    findInnerModule(modulePath: Array<string>) : IModule | null {
        let deepLevel = 0
        let currentModule = this.getInnerModules().find((module: IModule) => module.getName() === modulePath[deepLevel]) ?? null
        deepLevel++
        while (currentModule && deepLevel < modulePath.length) {
            currentModule = currentModule.getModuleTree().getInnerModules().find((module: IModule) => module.getName() === modulePath[deepLevel]) ?? null
            deepLevel++
        }
        return currentModule
    }

    findDeepInnerModuleByName(moduleName: string) : IModule | null {
        if (this._module.getName() === moduleName) {
            return this._module
        } else {
            let innerCount = this.getInnerModules().length 
            if (innerCount && innerCount > 0) {
                let result = null
                let innerModuleIterator = 0
                while (!result && innerModuleIterator < innerCount) {
                    result = this.getInnerModules()[innerModuleIterator].getModuleTree().findDeepInnerModuleByName(moduleName)
                    innerModuleIterator++
                }
                return result
            }
            return null
        }
    }
}