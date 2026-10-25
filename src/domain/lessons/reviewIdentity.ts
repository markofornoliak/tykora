import {words} from '../content/prompts';
import {graphemes} from '../typing/graphemes';
import {ESTIMATOR_VERSION} from '../skills/model';
import type {SupportedLocale} from '../content/library';

/** Canonical self-describing review-v2 identity.
 * Only public bank indices are encoded, never personal typed text.
 * Old identities are not passed through this validator and remain readable by
 * their legacy migration path.
 */
export function recoverReviewLength(promptId:string,locale:SupportedLocale):number|null {
 const match=/^course-L\d\d-\d\d-(ru|en)-review2-(\d+)-(\d+)-model-([a-z0-9-]+)-v-([0-9a-z]+(?:\.[0-9a-z]+)*)$/.exec(promptId);
 if(!match||match[1]!==locale||match[4]!==ESTIMATOR_VERSION)return null;
 const claimedLength=Number(match[2]),seed=Number(match[3]);
 if(!Number.isSafeInteger(claimedLength)||claimedLength<30||claimedLength>600||
    !Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)return null;
 const indices=match[5].split('.').map(v=>Number.parseInt(v,36));
 if(indices.length<12||indices.length>18||new Set(indices).size!==indices.length)return null;
 if(indices.some(i=>!Number.isSafeInteger(i)||i<0||i>=words[locale].length))return null;
 const reconstructed=indices.map(i=>words[locale][i]).join(' ');
 const realLength=graphemes(reconstructed).length;
 return realLength===claimedLength?realLength:null;
}
