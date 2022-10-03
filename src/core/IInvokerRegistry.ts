import ModuleMethod from "./ModuleMethod"
import ModuleMethodProperties from "./ModuleMethodProperties"

export default interface IInvokerRegistry {
    register(methodName: string, method: any, properties?: ModuleMethodProperties) : void
    getMethod(methodName: string) : ModuleMethod | undefined
    invoke(methodPath: string, param?: any | undefined) : any
    invokeWithFormatter(methodPath: string, formatter: any, param?: any | undefined) : any
    checkRequirements(): void
}