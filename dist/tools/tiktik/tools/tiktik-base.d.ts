declare const Tool: any;
export interface TiktikAgentParams {
}
export declare class TiktikBase extends Tool {
    name: string;
    description: string;
    constructor();
    getModel(): any;
    _call(query: string): Promise<string>;
}
export {};
