declare class VoiceSummaryAgent {
    protected tools: any[];
    protected agent: any;
    protected prompt_prefix: string;
    protected summary_chain: any;
    constructor();
    init(): Promise<this>;
    execute(input: string): Promise<any>;
}
export { VoiceSummaryAgent };
