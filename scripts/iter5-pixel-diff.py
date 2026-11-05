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
    if a.size!=b.size:raise SystemExit(f'Image dimensions differ: {path.name} {a.size}→{b.size}')
    diff=ImageChops.difference(a,b)
    changed=sum(1 for px in diff.getdata() if max(px[:3])>24)
    ratio=changed/(a.width*a.height)
    if changed:diff.convert('RGB').save(out/(path.stem+'-diff.png'))
    record={'name':path.name,'changedPixels':changed,'ratio':ratio,'pass':ratio<=threshold}
    rows.append(record)
    print('TYKORA_PIXEL_DIFF',json.dumps(record))
summary={'baselineRunId':42025942260,'baselineSha':'0ded9a7dff818509589c55ac53b0d8179d060d96',
 'threshold':threshold,'passed':sum(x['pass'] for x in rows),'total':len(rows),'files':rows}
(out/'summary.json').write_text(json.dumps(summary,indent=2))
print('TYKORA_PIXEL_DIFF_SUMMARY',json.dumps({k:v for k,v in summary.items() if k!='files'}))
if not all(x['pass'] for x in rows):raise SystemExit('Changed pixels exceed pinned threshold; do not silently rebaseline')
