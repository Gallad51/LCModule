import IModule from "../src/core/IModules"
import LCModule from "../src/modules/LCModule"

describe('Module Name', () => {
    test('Module Name in constructor', () => {
        const mod = new LCModule('test')
        expect(mod._moduleName).toBe('test')
    })

    test('Getter for Module Name', () => {
        const mod = new LCModule('test')
        expect(mod.getName()).toBe('test')
    })
})

describe('Module Arborescence', () => {
    describe('Module can have child modules', () => {
        test('Empty Module Array', () => {
            const mod = new LCModule('test')
            expect(mod.getModuleTree().getInnerModules().length).toBe(0)
        })

        test('Should be able to add a module', () => {
            const mod = new LCModule('test')
            const childModule = new LCModule('test2')
            mod.getModuleTree().addInnerModule(childModule)
            expect(mod.getModuleTree().getInnerModules().length).toBe(1)
            expect(mod.getModuleTree().getInnerModules()[0]).toBe(childModule)
        })
    })

    describe('Inner Modules have Parents Modules', () => {

        test('Should be able to getBack to parent Module', () => {
            const mod = new LCModule('test')
            const childModule = new LCModule('test2')
            mod.getModuleTree().addInnerModule(childModule)
            expect(childModule.getModuleTree().getParentModule()).toBe(mod)
        })
    })

    describe('Inner Modules allow to get back to Root Module', () => {
        test('Should be able to get to Root Module', () => {
            const mod = new LCModule('root')
            const mod1 = new LCModule('c1')
            const mod2 = new LCModule('c2')
            mod1.getModuleTree().addInnerModule(mod2)
            mod.getModuleTree().addInnerModule(mod1)
            expect(mod2.getModuleTree().getRootModule()).toBe(mod)
        })

        test('Should be able to get to Root Module with only one module', () => {
            const mod = new LCModule('root')
            expect(mod.getModuleTree().getRootModule()).toBe(mod)
        })

        test('Root module of root should be itself', () => {
            const mod = new LCModule('root')
            expect(mod.getModuleTree().getRootModule()).toBe(mod)
        })

        test('Should be able to get to Root Module with 2 modules', () => {
            const mod = new LCModule('root')
            const mod1 = new LCModule('c1')
            mod.getModuleTree().addInnerModule(mod1)
            expect(mod1.getModuleTree().getRootModule()).toBe(mod)
        })
    })

    describe('Modules should have path', () => {
        test('Root module path should be root', () => {
            const mod = new LCModule('root')
            expect(mod.getModuleTree().getFullPath()).toBe('root')
        })

        test('Inner modules should have path x:y', () => {
            const mod = new LCModule('root')
            const mod1 = new LCModule('c1')
            mod.getModuleTree().addInnerModule(mod1)
            expect(mod1.getModuleTree().getFullPath()).toBe("root:c1")
        })

        test('Double imbricated modules should have path x:y:z', () => {
            const mod = new LCModule('root')
            const mod1 = new LCModule('c1')
            const mod2 = new LCModule('c2')
            mod.getModuleTree().addInnerModule(mod1)
            mod1.getModuleTree().addInnerModule(mod2)
            expect(mod2.getModuleTree().getFullPath()).toBe("root:c1:c2")
        })
    })
})

describe('Module initialisation', () => {
    test('Module can be installed', () => {
        const mod = new LCModule('root')
        expect(mod.install).toBeDefined()
    })

    test('Installation should propagate to module tree', () => {
        const mod: IModule = new LCModule('root')
        const mod1: IModule = new LCModule('mod1')
        mod.getModuleTree().addInnerModule(mod1)
        mod.install()
        expect(mod1.isInstalled()).toBe(true)
    })

    test('Module Tree could not be alterate after install', () => {
        const mod: IModule = new LCModule('root')
        const mod1: IModule = new LCModule('mod1')
        mod.install()
        expect(() => { mod.getModuleTree().addInnerModule(mod1) }).toThrow()
    })
})

describe('Modules can expose and invoke methods', () => {
    describe('Modules Can expose methods', () => {
        test('Method registered should be accessable through ID', () => {
            function getZero () {
                return 0
            }
            const mod = new LCModule('root')
            mod.getRegistryInvoker().register(getZero.name, getZero)
            mod.install()
            expect(mod.getRegistryInvoker().invoke('getZero')).toBe(0)
        })

        test('Method invoking with parameters', () => {
            function getNumber(value: number) {
                return value
            }
            const mod = new LCModule('root')
            mod.getRegistryInvoker().register(getNumber.name, getNumber)
            mod.install()
            expect(mod.getRegistryInvoker().invoke('getNumber', 10)).toBe(10)
        })

        test('Invoking method that doesn\'t exist should failed', () => {
            function getNumber(value: number) {
                return value
            }
            const mod = new LCModule('root')
            mod.getRegistryInvoker().register(getNumber.name, getNumber)
            mod.install()
            expect(mod.getRegistryInvoker().invoke('getNumbers', 10)).toBe(undefined)
        })
    })

    describe('Method registered in another module of the tree should be available', () => {
        test('Method registered should be accessable through ID', () => {
            function getZero () {
                return 0
            }
            const mod = new LCModule('root')
            const mod1 = new LCModule('mod1')
            const mod2 = new LCModule('mod2')
            mod.getModuleTree().addInnerModule(mod1)
            mod.getModuleTree().addInnerModule(mod2)
            mod1.getRegistryInvoker().register(getZero.name, getZero)
            mod.install()
            expect(mod2.getRegistryInvoker().invoke('mod1:getZero')).toBe(0)
        })

        test('Method registered should be accessable through ID with deep tree', () => {
            function getZero () {
                return 0
            }
            const mod = new LCModule('root')
            const mod1 = new LCModule('mod1')
            const mod2 = new LCModule('mod2')
            const mod3 = new LCModule('mod3')
            const mod4 = new LCModule('mod4')
            const mod5 = new LCModule('mod5')
            mod.getModuleTree().addInnerModule(mod1)
            mod.getModuleTree().addInnerModule(mod2)
            mod2.getModuleTree().addInnerModule(mod3)
            mod3.getModuleTree().addInnerModule(mod4)
            mod4.getModuleTree().addInnerModule(mod5)
            mod5.getRegistryInvoker().register(getZero.name, getZero)
            mod3.getRegistryInvoker().register(getZero.name, getZero)
            mod.install()
            expect(mod1.getRegistryInvoker().invoke('mod2:mod3:mod4:mod5:getZero')).toBe(0)
            expect(mod1.getRegistryInvoker().invoke('mod2:mod3:getZero')).toBe(0)
        })

        test('Method registered should be accessable without full-chain', () => {
            function getZero () {
                return 0
            }
            const mod = new LCModule('root')
            const mod1 = new LCModule('mod1')
            const mod2 = new LCModule('mod2')
            const mod3 = new LCModule('mod3')
            const mod4 = new LCModule('mod4')
            const mod5 = new LCModule('mod5')
            mod.getModuleTree().addInnerModule(mod1)
            mod.getModuleTree().addInnerModule(mod2)
            mod2.getModuleTree().addInnerModule(mod3)
            mod3.getModuleTree().addInnerModule(mod4)
            mod4.getModuleTree().addInnerModule(mod5)
            mod5.getRegistryInvoker().register(getZero.name, getZero)
            mod3.getRegistryInvoker().register(getZero.name, getZero)
            mod.install()
            expect(mod1.getRegistryInvoker().invoke('mod5:getZero')).toBe(0)
            expect(mod1.getRegistryInvoker().invoke('mod3:getZero')).toBe(0)
        })

        test('Expect invoke on non-existing method to fail', () => {
            function getZero () {
                return 0
            }
            const mod = new LCModule('root')
            const mod1 = new LCModule('mod1')
            const mod2 = new LCModule('mod2')
            mod.getModuleTree().addInnerModule(mod1)
            mod.getModuleTree().addInnerModule(mod2)
            mod1.getRegistryInvoker().register(getZero.name, getZero)
            mod.install()
            expect(mod2.getRegistryInvoker().invoke('mod1:getOne')).toBe(undefined)
        })

        test('Expect invoke on non-existing module to fail', () => {
            function getZero () {
                return 0
            }
            const mod = new LCModule('root')
            const mod1 = new LCModule('mod1')
            const mod2 = new LCModule('mod2')
            mod.getModuleTree().addInnerModule(mod1)
            mod.getModuleTree().addInnerModule(mod2)
            mod1.getRegistryInvoker().register(getZero.name, getZero)
            mod.install()
            expect(mod2.getRegistryInvoker().invoke('mod3:getOne')).toBe(undefined)
        })
    })

    describe('Methods may be required to be invoked before install', () => {
        test('Method can be required before install', () => {
            const mod: IModule = new LCModule('root')
            mod.getRegistryInvoker().register('getZero', () => 0, { installRequired: true })
            expect(() => { mod.install() }).toThrow()
        })

        test('Install can pursue if required method is invoked beforehand', () => {
            const mod: IModule = new LCModule('root')
            mod.getRegistryInvoker().register('getZero', () => 0, { installRequired: true })
            mod.getRegistryInvoker().invoke('getZero')
            mod.install()
            expect(mod.isInstalled()).toBe(true)
        })

        test('Method defaulty require installation to be Invoke if not installRequired', () => {
            const mod: IModule = new LCModule('root')
            mod.getRegistryInvoker().register('getZero', () => 0)
            expect(() => { mod.getRegistryInvoker().invoke('getZero') }).toThrow()
        })

        test('Method should be allowed to be invoked before install if specified', () => {
            const mod: IModule = new LCModule('root')
            mod.getRegistryInvoker().register('getZero', () => 0, { allowBeforeInstall: true })
            expect(mod.getRegistryInvoker().invoke('getZero')).toBe(0)
        })
    })

    describe('Method should be able to use a formatter', () => {
        test('Method with a basic formatter', () => {
            const module = new LCModule('root')
            module.getRegistryInvoker().register('getData', () => {
                return [0, 1, 2, 3, 4, 5]
            })
            module.install()
            expect(module.getRegistryInvoker().invokeWithFormatter('getData', (res:Array<number>) => res.map((e:number) => e + 1))).toStrictEqual([1, 2, 3, 4, 5, 6])
        })

        test('Method with null formatter', () => {
            const module = new LCModule('root')
            module.getRegistryInvoker().register('getData', () => {
                return [0, 1, 2, 3, 4, 5]
            })
            module.install()
            expect(module.getRegistryInvoker().invokeWithFormatter('getData', null)).toStrictEqual([0, 1, 2, 3, 4, 5])
        })

        test('Method with a basic formatter and a param', () => {
            const module = new LCModule('root')
            module.getRegistryInvoker().register('getData', (start:number) => {
                return [start, start +1, start+2, start+3, start+4, start+5]
            })
            module.install()
            expect(module.getRegistryInvoker().invokeWithFormatter('getData', (res:Array<number>) => res.map((e:number) => e.toString()), 5)).toStrictEqual(['5', '6', '7', '8', '9', '10'])
        })
    })
})

describe('Module may handle a state', () => {
    describe('State should be empty object by default', () => {
        const module:IModule = new LCModule('root')
        expect(module.getState()).toStrictEqual({})
    })

    describe('State should allow adding attributes freely', () => {
        const module:IModule = new LCModule('root')
        module.getState().testAttribute = 'TEST'
        expect(module.getState().testAttribute).toBe('TEST')
    })
})

describe('Module should handle a logger', () => {
    test('Logger should work', () => {
        let called = 0
        const logger = {
            info(message: string, data: any) { called++ },
            warn(message: string, data: any) { called++ },
            error(message: string, data: any) { called++ },
            debug(message: string, data: any) { called++ },
            crit(message: string, data: any) { called++ }
        }

        const module : IModule = new LCModule('root')
        module.setLogger(logger)
        module.getLogger().info('test Logging')
        expect(called).toBeGreaterThan(0)
    })

    test('Default Logger should exist', () => {
        const module : IModule = new LCModule('root')
        expect(module.getLogger()).toBeDefined()
        expect(module.getLogger().info).toBeDefined()
        expect(module.getLogger().debug).toBeDefined()
        expect(module.getLogger().error).toBeDefined()
        expect(module.getLogger().warn).toBeDefined()
        expect(module.getLogger().crit).toBeDefined()
        module.getLogger().info('test Logging')
        module.getLogger().debug('test Logging')
        module.getLogger().error('test Logging')
        module.getLogger().warn('test Logging')
        module.getLogger().crit('test Logging')
    })

    test('Module Logging should propagate to inner modules', () => {
        let called = 0
        const logger = {
            info(message: string, data: any) { called++ },
            warn(message: string, data: any) { called++ },
            error(message: string, data: any) { called++ },
            debug(message: string, data: any) { called++ },
            crit(message: string, data: any) { called++ }
        }

        const module : IModule = new LCModule('root')
        const mod1 : IModule = new LCModule('mod1')
        module.getModuleTree().addInnerModule(mod1)

        module.setLogger(logger)
        
        mod1.getLogger().info('test Logging')
        expect(called).toBeGreaterThan(0)
    })

    test('Module Logging should propagate to independant modules', () => {
        let called = 0
        const logger = {
            info(message: string, data: any) { called++ },
            warn(message: string, data: any) { called++ },
            error(message: string, data: any) { called++ },
            debug(message: string, data: any) { called++ },
            crit(message: string, data: any) { called++ }
        }

        const module : IModule = new LCModule('root')
        const mod1 : IModule = new LCModule('mod1')

        module.setLogger(logger)
        
        mod1.getLogger().info('test Logging')
        expect(called).toBe(0)
    })
})