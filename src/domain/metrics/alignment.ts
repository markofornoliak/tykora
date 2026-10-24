import { graphemes } from '../typing/graphemes';

export type ErrorKind = 'insertion' | 'omission' | 'substitution' | 'transposition';
export interface TextError { kind: ErrorKind; expectedIndex: number; expected: string; actual: string }
export interface Alignment { distance: number; correct: number; errors: readonly TextError[] }

type Operation = 0 | 1 | 2 | 3 | 4 | 5;
const UNREACHABLE = 0x3fffffff;

/** Exact optimal-string-alignment Damerau–Levenshtein distance and traceback.
 * - Works on Unicode grapheme clusters, not UTF-16 code units.
 * - Excludes identical leading/trailing graphemes from the dynamic program.
 * - Uses a progressively wider diagonal band, ultimately giving the exact
 *   unrestricted-in-band optimum even for arbitrary edit patterns.
 * - Memory: O(n*m) bytes for traceback, O(m) for distances (not O(n*m) JS objects).
 * - Only called after a session ends; never on each keypress.
 * Note: OSA is not unrestricted Damerau–Levenshtein.
 */
export function alignText(expected: string, observed: string): Alignment {
  const allA = graphemes(expected), allB = graphemes(observed);
  let prefix = 0;
  while (prefix < allA.length && prefix < allB.length && allA[prefix] === allB[prefix]) prefix++;
  let suffix = 0;
  while (suffix < allA.length-prefix && suffix < allB.length-prefix &&
    allA[allA.length-1-suffix]===allB[allB.length-1-suffix]) suffix++;
  const a=allA.slice(prefix,allA.length-suffix), b=allB.slice(prefix,allB.length-suffix);
  const n=a.length,m=b.length;
  if(!n && !m) return {distance:0,correct:prefix+suffix,errors:[]};
  // This safety cap is beyond the largest user-supplied exercise (6,000 graphemes).
  // The UI validates uploads separately. The cap protects low-memory browsers.
  if(n>6500 || m>6500) throw new Error('Text exceeds the supported alignment limit');
  const width=m+1;
  const ops=new Uint8Array((n+1)*width);
  let resultDistance=UNREACHABLE;
  for(let band=Math.min(Math.max(n,m),Math.max(Math.abs(n-m)+8,32));;band=Math.min(Math.max(n,m),band*2)) {
    let twoBack=new Int32Array(width).fill(UNREACHABLE);
    let previous=new Int32Array(width).fill(UNREACHABLE);
    let current=new Int32Array(width).fill(UNREACHABLE);
    for(let j=0;j<=Math.min(m,band);j++) {
      previous[j]=j;
      if(j)ops[j]=4;
    }
    for(let i=1;i<=n;i++) {
      current.fill(UNREACHABLE);
      if(i<=band){current[0]=i;ops[i*width]=3;}
      const from=Math.max(1,i-band),to=Math.min(m,i+band);
      for(let j=from;j<=to;j++) {
        let best=UNREACHABLE;
        let step:Operation=0;
        if(a[i-1]===b[j-1] && previous[j-1]<best){
          best=previous[j-1];step=1;
        }
        if(previous[j-1]+1<best){best=previous[j-1]+1;step=2;}
        if(previous[j]+1<best){best=previous[j]+1;step=3;}
        if(current[j-1]+1<best){best=current[j-1]+1;step=4;}
        if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]&&twoBack[j-2]+1<=best){
          best=twoBack[j-2]+1;step=5;
        }
        current[j]=best;
        ops[i*width+j]=step;
      }
      const old=twoBack;twoBack=previous;previous=current;current=old;
    }
    resultDistance=previous[m];
    if(resultDistance<UNREACHABLE) {
      // A path reaching the endpoint is not necessarily globally optimal when
      // constrained to a band. If it could have touched the band boundary,
      // widen. A path that leaves and re-enters the band has >= band edits.
      if(band>=Math.max(n,m) || resultDistance<band-Math.abs(n-m))break;
    }
    if(band>=Math.max(n,m))break;
  }
  const errors:TextError[]=[];
  let matched=0,i=n,j=m;
  while(i||j){
    const step=ops[i*width+j] as Operation;
    if(step===1){matched++;i--;j--;}
    else if(step===5){errors.push({kind:'transposition',expectedIndex:prefix+i-2,expected:a.slice(i-2,i).join(''),actual:b.slice(j-2,j).join('')});i-=2;j-=2;}
    else if(step===2){errors.push({kind:'substitution',expectedIndex:prefix+i-1,expected:a[i-1],actual:b[j-1]});i--;j--;}
    else if(step===3){errors.push({kind:'omission',expectedIndex:prefix+i-1,expected:a[i-1],actual:''});i--;}
    else if(step===4){errors.push({kind:'insertion',expectedIndex:prefix+i,expected:'',actual:b[j-1]});j--;}
    else throw new Error('Invalid OSA backtrace');
  }
  errors.reverse();
  return {distance:resultDistance,correct:prefix+suffix+matched,errors};
}
