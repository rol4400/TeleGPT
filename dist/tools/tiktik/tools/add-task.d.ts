import { TiktikBase } from './tiktik-base.js';
export declare class TiktikAddTask extends TiktikBase {
    name: string;
    description: string;
    constructor();
    _call(query: string): Promise<string>;
}
