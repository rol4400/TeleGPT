type RunTiktikAddTask = {
    model: any;
};
declare const runAddTask: (query: string, { model }: RunTiktikAddTask) => Promise<string>;
export { runAddTask };
