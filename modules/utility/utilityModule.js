import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

const CurseMatcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
const CensorStrategy = (ctx) => 'X'.repeat(ctx.matchLength);
const CurseCensor = new TextCensor().setStrategy(CensorStrategy);

export default class UtilityModule extends ServerModule {
    async LoadModule () {

    }

    async UnloadModule () {

    }

    TruncateString = (string, maxLen) => {
        return string.length > maxLen ? string.substring(0, maxLen) : string;
    }

    Clamp = (num, lower, upper) => {
        return Math.min(Math.max(num, lower), upper);
    }

    RemoveAllBefore = (inputString, splitString) => {
        return inputString.substring(inputString.indexOf(splitString) + 1)
    }

    SimplifyName = (name) => { // Prevent Extra Long Names
        return this.TruncateString(name.replace(/^-+|-+$|[^A-Za-z0-9]+/g, ""), 20)
    }

    SimplifyChat = (msg) => { // Prevent Extra Long Names
        return this.TruncateString(msg.replace(/^-+|-+$|[^A-Za-z0-9 :<>!.,?/()_-]+/g, ""), 200)
    }
    
    CensorSwears = (msg) => {
        return CurseCensor.applyTo(msg,CurseMatcher.getAllMatches(msg))
    }
}