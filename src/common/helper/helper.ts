import moment, { unitOfTime } from "moment";
import { randomBytes, randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class Helpers {
    static MergeDeep<T, U>(target: T, ...sources: U[]): T {
        if (!sources.length) return target;
        const source = sources.shift();
        if (this.IsObject(target) && this.IsObject(source)) {
            for (const key in source) {
                if (this.IsObject(source[key])) {
                    //@ts-ignore
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    //@ts-ignore
                    this.MergeDeep(target[key], source[key]);
                } else {
                    //@ts-ignore
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return this.MergeDeep(target, ...sources);
    }
    static IsObject(item: any) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    static modifyDate(
        operation: 'a' | 's' | 'c' = 'c',
        amount: number = 0,
        unit: unitOfTime.DurationConstructor = 'minutes',
        format: string = 'YYYY-MM-DD HH:mm:ss'
    ): string {
        const date = moment();
        if (operation === 'a') date.add(amount, unit);
        if (operation === 's') date.subtract(amount, unit);
        return date.format(format);
    }
    static generateRandomNumber(): number {
        const min = 100000;
        const max = 999999;
        const range = max - min + 1;
        const randomBytesBuffer = randomBytes(4);
        const randomValue = randomBytesBuffer.readUInt32BE(0) % range;
        return min + randomValue;
    }

  
    static randomString(length: number): string {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = '';
        while (length--) {
            result += chars[randomInt(0, chars.length)];
        }
        return result + Date.now() * 1000;
    }


    static v4Token() {
        return uuidv4();
    }

    static jsonFormatting(payload: any): string {
        if (typeof payload === 'object') {
            const formattedObject = Object.entries(payload).map(([key, value]) => ({ [key]: value }));
            return this.jsonStringify(formattedObject);
        }
        return this.jsonStringify(payload);
    }
    static jsonStringify(payload: any): string {
        return typeof payload === 'object' ? JSON.stringify(payload) : payload;
    }

    static jsonParse(payload: any): string {
        return JSON.parse(payload);
    }
    
}