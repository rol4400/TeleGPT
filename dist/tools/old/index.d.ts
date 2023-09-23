declare class MessageSenderAgent {
    protected tools: any[];
    protected agent: any;
    protected openApiOptions: any;
    protected executorOptions: any;
    memory: any;
    prompt_prefix: any;
    sendTelegramMessage: ({ chat_id, message }: any) => Promise<void>;
    constructor(memory: any);
    init(): Promise<this>;
    execute(input: string): Promise<any>;
}
export { MessageSenderAgent };
