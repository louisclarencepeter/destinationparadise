"""Outline the approved typefaces for a deterministic, self-contained SVG."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

mobile = Path(__file__).resolve().parents[2]
font_paths = {
    'script': mobile / 'node_modules/@expo-google-fonts/kaushan-script/400Regular/KaushanScript_400Regular.ttf',
    'sans': mobile / 'node_modules/@expo-google-fonts/montserrat/500Medium/Montserrat_500Medium.ttf',
}
fonts = {key: TTFont(filename) for key, filename in font_paths.items()}

def outline(font_key, text, x, baseline, size, spacing=0):
    font = fonts[font_key]
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    kerning = {}
    if 'kern' in font:
        for table in font['kern'].kernTables:
            kerning.update(table.kernTable)
    result = []
    previous = None
    for character in text:
        glyph_name = cmap[ord(character)]
        if previous:
            x += kerning.get((previous, glyph_name), 0) * scale
        pen = SVGPathPen(glyphs)
        glyphs[glyph_name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        result.append(pen.getCommands())
        x += font['hmtx'].metrics[glyph_name][0] * scale + spacing
        previous = glyph_name
    return ' '.join(result)

print(json.dumps({
    'region': outline('sans', 'ZANZIBAR & TANZANIA', 135, 103, 14, 2.2),
    'destination': outline('script', 'Destination', 78, 199, 69),
    'paradise': outline('script', 'Paradise', 81, 281, 83),
    'explore': outline('sans', 'Explore', 86, 348, 18),
    'plan': outline('sans', 'Plan', 194, 348, 18),
    'weather': outline('sans', 'Weather', 270, 348, 18),
}))
