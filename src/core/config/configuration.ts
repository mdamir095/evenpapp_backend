import { Helpers } from '@common/helper/helper';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

const ENV = process.env.NODE_ENV || 'local';

export default () => {
    const baseSettings = JSON.parse(readFileSync(path.resolve(__dirname, '../../../config', 'base.json'), 'utf8'));
    const envSettings = JSON.parse(readFileSync(path.resolve(__dirname, '../../../config', `${ENV}.json`), 'utf8'));
    const final = Helpers.MergeDeep(baseSettings, envSettings);
    return yaml.load(JSON.stringify(final)) as Record<string, any>;
};