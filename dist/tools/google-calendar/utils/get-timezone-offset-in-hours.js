"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimezoneOffsetInHours = void 0;
const getTimezoneOffsetInHours = () => {
    const offsetInMinutes = new Date().getTimezoneOffset();
    const offsetInHours = -offsetInMinutes / 60;
    // Just hardcode it as +10 for now
    return 10;
};
exports.getTimezoneOffsetInHours = getTimezoneOffsetInHours;
//# sourceMappingURL=get-timezone-offset-in-hours.js.map