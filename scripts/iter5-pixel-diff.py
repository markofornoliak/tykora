from pathlib import Path
from PIL import Image, ImageChops
import os,json
baseline=Path('performance-artifacts/iter5-golden')
new=Path('performance-artifacts/iter5-visual')
out=Path('performance-artifacts/iter5-pixel-diff')
out.mkdir(parents=True,exist_ok=True)
threshold=float(os.environ.get('TYKORA_PIXEL_DIFF_THRESHOLD','0.015'))
files=sorted(baseline.rglob('*.png'))
if len(files)!=36:raise SystemExit(f'Expected 36 pinned golden screenshots; found {len(files)}')
rows=[]
for path in files:
    actual=new/path.name
    if not actual.exists():raise SystemExit(f'Missing current screenshot: {actual}')
    a=Image.open(path).convert('RGBA')
    b=Image.open(actual).convert('RGBA')
    dimensionMismatch=a.size!=b.size
    if dimensionMismatch:
        canvasSize=(max(a.width,b.width),max(a.height,b.height))
        aa=Image.new('RGBA',canvasSize,(255,255,255,255))
        bb=Image.new('RGBA',canvasSize,(255,255,255,255))
        aa.paste(a,(0,0));bb.paste(b,(0,0))
        diff=ImageChops.difference(aa,bb)
    else:diff=ImageChops.difference(a,b)
    changed=sum(1 for px in diff.getdata() if max(px[:3])>24)
    ratio=changed/(diff.width*diff.height)
    if changed or dimensionMismatch:diff.convert('RGB').save(out/(path.stem+'-diff.png'))
    record={'name':path.name,'changedPixels':changed,'ratio':ratio,
      'referenceSize':a.size,'currentSize':b.size,'dimensionMismatch':dimensionMismatch,
      'pass':not dimensionMismatch and ratio<=threshold}
    rows.append(record)
    print('TYKORA_PIXEL_DIFF',json.dumps(record))
summary={'baselineRunId':42281897793,'baselineSha':'32236f2d21d346e4ce5cfb6eb527f3c91d9de482',
 'threshold':threshold,'passed':sum(x['pass'] for x in rows),'total':len(rows),'files':rows}
(out/'summary.json').write_text(json.dumps(summary,indent=2))
print('TYKORA_PIXEL_DIFF_SUMMARY',json.dumps({k:v for k,v in summary.items() if k!='files'}))
if not all(x['pass'] for x in rows):raise SystemExit('Changed pixels exceed pinned threshold; do not silently rebaseline')
