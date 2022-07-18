import { Logger } from "tslog";

export const Log: Logger = new Logger({
    displayInstanceName: false,
    displayFunctionName: true,
    prefix: [],
    displayDateTime: false,
});
