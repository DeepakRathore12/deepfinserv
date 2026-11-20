import re, sys
src = open('/home/claude/dk/project/Main.dc.html').read()
def jsx(svg):
    svg = re.sub(r'\s(stroke|fill|font|text|stop|clip|stroke-line|letter|stroke-dash)-([a-z]+)(-[a-z]+)?=', lambda m: ' '+m.group(1)+m.group(2).capitalize()+((m.group(3)[1:].capitalize()) if m.group(3) else '')+'=', svg)
    svg = svg.replace('aria-hidden="true"', 'aria-hidden="true"')
    return svg
out = ["// Generated from the design canvas by tools-svg.py. Edit the design, then regenerate.", "import type { ProductSlug } from '@dk/shared';", ""]
# product art in order of slugs
sec = src[src.index('<!-- PRODUCTS -->'):src.index('<!-- PROCESS -->')]
arts = re.findall(r'(<svg aria-hidden="true" width="112" height="112".*?</svg>)', sec, re.S)
slugs = ['personal-loan','home-loan','business-loan','loan-against-property','loan-against-securities','education-loan','car-loan','balance-transfer','credit-cards']
assert len(arts)==9, len(arts)
out.append("const ART: Record<ProductSlug, React.ReactElement> = {")
for s,a in zip(slugs,arts):
    a = jsx(a).replace('<svg aria-hidden="true" width="112" height="112"', '<svg aria-hidden="true" className="bob" width="112" height="112"')
    out.append(f"  '{s}': (\n    {a}\n  ),")
out.append("};\n")
out.append("export function ProductArt({ slug }: { slug: ProductSlug }) {\n  return ART[slug];\n}\n")
ban = src[src.index('<!-- PROMO BANNERS -->'):src.index('<!-- PRODUCTS -->')]
bs = re.findall(r'(<svg aria-hidden="true" width="1[23]0".*?</svg>)', ban, re.S)
assert len(bs)==3, len(bs)
names=['CoinsArt','HouseArt','GaugeArt']
for n,b in zip(names,bs):
    b = jsx(b).replace(' style="align-self: flex-end; flex: none"', ' className="bob shrink-0 self-end"')
    out.append(f"export function {n}() {{\n  return (\n    {b}\n  );\n}}\n")
open('/home/claude/dk-app/apps/frontend/src/components/illustrations/art.tsx','w').write('\n'.join(out))
print('ok')
