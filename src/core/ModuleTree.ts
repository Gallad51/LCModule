import IModule from "./IModules";
import IModuleTree from "./IModuleTree";

export default class ModuleTree implements IModuleTree<IModule> {
    _innerModules : Array<IModule>
    _module : IModule | undefined
    _parentModule : IModule | undefined
    _fullPath : string
    
    constructor() {
        this._innerModules = []
        this._fullPath = ""
    }
    
    setCurrentModule(node: IModule): void {
        this._module = node
        this._fullPath = node.getName()
    }
    
    getParentModule(): IModule | undefined {
        return this._parentModule
    }

    setParentModule(parentNode: IModule): void {
        if (this._module) {
            this._parentModule = parentNode
            this._fullPath = this._module.getName()
            let parent: IModule | undefined = this._module
            while (parent?.getModuleTree().getParentModule()) {
                parent = parent.getModuleTree().getParentModule()
                if (parent) {
                    this._fullPath = [parent.getName(), this._fullPath].join(':')
                }
            }
        } else {
            throw new Error('Module must be set in tree before doing any action')
        }
    }

    getInnerModules(): IModule[] {
        return this._innerModules
    }

    addInnerModule(node: IModule): void {
        if (this._module) {
            if (!this._module.isInstalled()) {
                node.getModuleTree().setParentModule(this._module)
                node.setLogger(this._module.getLogger())
                this._innerModules.push(node)
            } else {
                throw new Error('Could not alterate Module Tree after installation')
            }
        } else {
            throw new Error('Module must be set in tree before doing any action')
        }
    }

    getRootModule() : IModule {
        if (this._module) {
            let current: IModule | undefined = this._module
            while (current.getModuleTree().getParentModule()) {
                const parent = current.getModuleTree().getParentModule()
                if (parent) {
                    current = parent
                }
            }
            return current
        } else {
            throw new Error('Module must be set in tree before doing any action')
        }
    }

    getFullPath() : string {
        return this._fullPath
    }

    findInnerModule(modulePath: Array<string>) : IModule | null {
        if (this._module) {
            let deepLevel = 0
            let currentModule = this.getInnerModules().find((module: IModule) => module.getName() === modulePath[deepLevel]) ?? null
            deepLevel++
            while (currentModule && deepLevel < modulePath.length) {
                currentModule = currentModule.getModuleTree().getInnerModules().find((module: IModule) => module.getName() === modulePath[deepLevel]) ?? null
                deepLevel++
            }
            return currentModule
        } else {
            throw new Error('Module must be set in tree before doing any action')
        }
    }

    findDeepInnerModuleByName(moduleName: string) : IModule | null {
        if (this._module) {
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
        } else {
            throw new Error('Module must be set in tree before doing any action')
        }
    }
}