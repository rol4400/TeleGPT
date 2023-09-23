declare const Tool: any;
export interface MessageSenderAgentParams {
}
export declare class MessageSenderBase extends Tool {
    name: string;
    description: string;
    constructor(fields?: MessageSenderAgentParams);
    getModel(): any;
    _call(input: string): Promise<string>;
}
export {};
