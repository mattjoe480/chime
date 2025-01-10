import {serviceHelper} from "grpc-js-reflection-client";
const { GrpcReflection } = require('grpc-js-reflection-client');
const grpc =  require('@grpc/grpc-js');
import {ListMethodsType} from "grpc-js-reflection-client/dist/Types/ListMethodsType";

const url = process.env.GRPC_SERVICE_URL!;
const client = new grpc.Client(url, grpc.credentials.createInsecure());
const reflectionClient = new GrpcReflection(url, grpc.ChannelCredentials.createInsecure());

export async function getAvailableServices(): Promise<string[]> {
    return reflectionClient.listServices();
}

export async function getMethods(service: string): Promise<Array<ListMethodsType>> {
    return reflectionClient.listMethods(service);
}

export async function getService<T>(service: string){
    let name = service.split(".");
    return serviceHelper<T>({
        host: url,
        credentials: grpc.credentials.createInsecure(),
        protoLoaderOptions: {keepCase: true, enums: String, longs: String},
        proto_filename: name[0] + ".proto",
        proto_symbol: "",
        servicePath: service
    })
}
export function  addAuthToken(authToken: string){
    const metadata = new grpc.Metadata();
    metadata.add('authorization', `Bearer ${authToken}`);  // Add the token to the metadata
    return metadata;
}

export async function display() {
    let services = await getAvailableServices();
    for (const service of services) {
        let methods = await getMethods(service);
        for (const method of methods) {
            console.log("Service " + service + ": " + method.name);
        }
    }

}
