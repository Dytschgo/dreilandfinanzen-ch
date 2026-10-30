"""One-time authoring utility for the inline atlas; not required to run the page."""
from pathlib import Path
import math
import random

random.seed(27)
regions = [
    ('fr', '400,300 120,195 400,90 550,146 470,200', '#d3dfe4', '#9eafb9', '#657f90'),
    ('de', '400,300 470,200 550,146 680,195 680,405 540,458', '#e7d5ae', '#b8a279', '#9c8157'),
    ('ch', '400,300 540,458 400,510 120,405 120,195', '#e6c5bb', '#bd948a', '#a07770'),
]
river = 'M458 65C483 119 405 137 427 192S366 269 406 319S399 380 489 401S575 463 698 454'
contours = []
for cx, cy, sx, sy in [(227,230,1.7,.65),(620,210,1.2,.65),(290,420,1.6,.6),(620,460,1.4,.65),(500,80,1.8,.55)]:
    for n in range(1,24):
        points = []
        for i in range(101):
            angle = i / 100 * math.tau
            radius = n*9 + math.sin(angle*3+n*.1)*5 + math.sin(angle*5)*2.8
            x = cx+math.cos(angle)*radius*sx
            y = cy+math.sin(angle)*radius*sy
            points.append(f'{x:.1f},{y:.1f}')
        contours.append('<path d="M'+' L'.join(points)+' Z"/>')

svg = ['<svg id="atlas-svg" viewBox="0 0 800 580" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">',
       '<defs><filter id="land-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="13" flood-color="#062B63" flood-opacity=".12"/></filter>',
       '<pattern id="map-grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".45" fill="#062B63" opacity=".18"/></pattern>',
       '<g id="contours" fill="none" stroke-width=".65">'+''.join(contours)+'</g>']
for name, points, *_ in regions:
    svg.append(f'<clipPath id="clip-{name}"><polygon points="{points}"/></clipPath>')
svg.append('</defs>')
svg.append('<g stroke="#062B63" stroke-width=".6" opacity=".2"><path d="M50 300H750M400 35V550" stroke-dasharray="3 7"/><path d="M70 110h12m-6-6v12M720 440h12m-6-6v12M100 470h12m-6-6v12M690 95h12m-6-6v12"/></g>')
for name, points, color, edge, ink in regions:
    svg.append(f'<g class="land land-{name}"><g filter="url(#land-shadow)"><polygon points="{points}" fill="{edge}" transform="translate(0 22)"/>')
    # The vertical sides of the relief are actual faces, not a blurred imitation.
    pts = [tuple(map(int, pair.split(','))) for pair in points.split()]
    for i in range(len(pts)):
        x1,y1=pts[i];x2,y2=pts[(i+1)%len(pts)]
        svg.append(f'<path d="M{x1} {y1}L{x2} {y2}v22L{x1} {y1+22}Z" fill="{edge}" stroke="{edge}" stroke-width=".7"/>')
    svg.append(f'<polygon points="{points}" fill="{color}"/></g>')
    svg.append(f'<g clip-path="url(#clip-{name})"><rect width="800" height="580" fill="url(#map-grain)"/><use href="#contours" stroke="{ink}" opacity=".48"/>')
    # Fine cadastral-like routes establish the language of an atlas.
    svg.append('<g fill="none" stroke="#f9f6ef" stroke-width="2" opacity=".75"><path d="M100 230L300 320 465 217 705 303M190 420L355 325 577 463M240 120L340 223 530 125M545 90L560 320 690 389"/></g>')
    svg.append(f'<path d="{river}" fill="none" stroke="#f6f4ec" stroke-width="39"/><path d="{river}" fill="none" stroke="#0A4682" stroke-width="29"/><path d="{river}" fill="none" stroke="#5d8da9" stroke-width="1.2" transform="translate(-5 0)"/><path d="{river}" fill="none" stroke="#86aabe" stroke-width=".8" transform="translate(5 0)"/>')
    # Small, deliberately schematic urban forms and groves.
    for x,y in [(280,213),(306,227),(320,203),(348,232),(529,273),(556,285),(573,260),(559,307),(320,365),(346,377),(364,355)]:
        w,h=14,10
        svg.append(f'<g transform="translate({x} {y})"><path d="M0 0l{w} -7 12 6 -{w} 7Z" fill="#f5eee0" stroke="{ink}" stroke-width=".5"/><path d="M0 0v{h}l12 6V6ZM12 6l{w} -7v{h}l-{w} 7Z" fill="{edge}" stroke="{ink}" stroke-width=".5"/></g>')
    for cx,cy in [(215,225),(600,337),(235,382),(470,151)]:
        for j in range(12):
            x=cx+random.uniform(-20,20);y=cy+random.uniform(-13,13)
            svg.append(f'<path d="M{x:.1f} {y:.1f}v-8m-3 3 3-6 3 6m-7 3 4-7 4 7" fill="none" stroke="{ink}" stroke-width=".8" opacity=".9"/>')
    svg.append('<g fill="none" stroke="#f8f3e9" stroke-width="5"><path d="M382 271L424 284M413 355L449 347"/></g><g fill="none" stroke="#062B63" stroke-width=".8"><path d="M381 268L425 281M383 274L423 287M412 352L448 344M414 358L450 350"/></g>')
    svg.append('</g>')
    svg.append(f'<polygon points="{points}" fill="none" stroke="#fbf7ee" stroke-width="2"/>')
    svg.append('</g>')
svg.append('<g transform="translate(400 300)"><circle r="13" fill="#f9f6ef" stroke="#062B63" stroke-width="1"/><circle r="4" fill="#CE2530"/></g></svg>')

target = Path(__file__).with_name('index.html')
html = target.read_text(encoding='utf-8')
start = '<!-- ATLAS_SVG -->'
if start in html:
    html = html.replace(start, '<!-- ATLAS_START -->'+''.join(svg)+'<!-- ATLAS_END -->')
else:
    before, rest = html.split('<!-- ATLAS_START -->',1)
    _, after = rest.split('<!-- ATLAS_END -->',1)
    html = before+'<!-- ATLAS_START -->'+''.join(svg)+'<!-- ATLAS_END -->'+after
target.write_text(html, encoding='utf-8')
