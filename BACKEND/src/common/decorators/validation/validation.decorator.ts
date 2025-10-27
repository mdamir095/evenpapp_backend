import { IsBoolean, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { applyDecorators } from '@nestjs/common';
export function IsOptionalString() {
    return applyDecorators(
        IsString(),
        IsOptional(),
        Matches(
            /^(?!.*(?:https?:\/\/|www\.))/,
            { message: 'Hyperlinks are not allowed' },
        ),
    );
}
export function IsOptionalBoolean() {
    return applyDecorators(IsBoolean(), IsOptional());
}
export function IsOptionalNumber() {
    return applyDecorators(IsNumber(), IsOptional());
}