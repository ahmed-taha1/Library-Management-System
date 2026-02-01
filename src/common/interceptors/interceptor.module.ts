import { Global, Module } from "@nestjs/common";
import { TransformInterceptor } from "./transform.interceptor";

@Global()
@Module({
    providers: [TransformInterceptor],
    exports: [TransformInterceptor],
})
export class InterceptorModule {}