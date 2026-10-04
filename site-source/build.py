"""Portable static build. Requires only Python's standard library."""
from pathlib import Path
import hashlib,json,re,shutil,sys
source=Path(__file__).resolve().parent
destination=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else source.parent/'site'
assert destination!=source and source not in destination.parents, 'Use an output folder outside the source folder'
assert destination!=Path('/'), 'A dedicated output folder is required'
shutil.copytree(source/'static',destination,dirs_exist_ok=True)
template=(source/'template.html').read_text()
style_version=hashlib.sha256((source/'static/assets/site.css').read_bytes()).hexdigest()[:12]
template=template.replace('href="assets/site.css"',f'href="assets/site.css?v={style_version}"')
pages=json.loads((source/'pages.json').read_text())
for filename,settings in pages.items():
    page=settings['page'];text=template
    for name in ('page','title','description','canonical'):text=text.replace('@@'+name.upper()+'@@',settings[name])
    def visible(match):
        tag=match[0];key=re.search(r'data-view="([^"]+)"',tag)[1]
        tag=re.sub(r'\s+hidden(?:="[^"]*")?','',tag)
        return tag if key==page else tag[:-1]+' hidden>'
    text=re.sub(r'<div\b[^>]*data-view="[^"]+"[^>]*>',visible,text)
    def selected(match):
        tag=re.sub(r'\s+aria-current="[^"]*"','',match[0]);key=re.search(r'data-page="([^"]+)"',tag)[1]
        return tag[:-1]+' aria-current="page">' if key==page else tag
    text=re.sub(r'<a\b[^>]*data-page="[^"]+"[^>]*>',selected,text)
    (destination/filename).write_text(text)
files={str(p.relative_to(destination)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(destination.rglob('*')) if p.is_file() and p.name!='release-manifest.json'}
(destination/'release-manifest.json').write_text(json.dumps({'format':1,'canonical':'https://mingdeyu.github.io/','files':files},indent=2))
print(json.dumps({'output':str(destination),'pages':len(pages),'files':len(files)}))
