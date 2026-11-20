"""
Arma los datos estaticos del articulo (static/data, static/crests, static/kits).

Solo usa la libreria estandar. Lee:
  - el fixture de la Liga Profesional (feed de Opta que usa el widget de ligaprofesional.ar)
  - los csv ya procesados del proyecto football-kits (no se vuelve a scrapear nada)

Uso:
  python3 scripts/build_data.py                 # usa scripts/raw/opta_f1.json si existe, si no lo baja
  python3 scripts/build_data.py --refresh       # vuelve a bajar el fixture
  DATA_DIR=/ruta/a/football-kits-data python3 scripts/build_data.py
"""

import csv
import datetime
import json
import os
import re
import shutil
import sys
import unicodedata
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_FILE = os.path.join(ROOT, 'scripts', 'raw', 'opta_f1.json')
STATIC = os.path.join(ROOT, 'static')
DATA_DIR = os.environ.get('DATA_DIR', '/media/ezequiel/52782F28782F09F5/football-kits')

# Credenciales publicas del widget de fixture de ligaprofesional.ar (las manda el propio sitio)
FEED_URL = (
    'https://omo.akamai.opta.net/auth/competition.php?feed_type=f1&competition=724&season_id=2026'
    '&user=OW2017&psw=dXWg5gVZ&sps=widgets&jsoncallback=cb'
)
CREST_URL = (
    'https://omo.akamai.opta.net/image.php?secure=true&h=omo.akamai.opta.net'
    '&sport=football&entity=team&description=badges&dimensions=150&id={id}'
)
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)', 'Referer': 'https://www.ligaprofesional.ar/'}

# Primera Division 2026 en football-kits
KITS_COUNTRY, KITS_LEAGUE, KITS_SEASON = 'Argentina', 'Primera Division', '2026'
BET_CATEGORIES = {'Apuestas', 'Apuestas Online'}
BET_INDUSTRY = 'Apuestas'
OTHERS_INDUSTRY = 'Otros'
NO_SPONSOR_INDUSTRY = 'Sin sponsor'

# id de Opta -> nombre del equipo en kits.csv
OPTA_TO_KITS = {
    't1313': 'CA Belgrano', 't3638': 'Instituto', 't8625': 'Defensa y Justicia',
    't9280': 'Barracas Central', 't1243': 'CA Independiente', 't2473': 'CA Lanús',
    't3579': 'CA Platense', 't1095': "Newell's Old Boys", 't9319': 'Deportivo Riestra',
    't986': 'Racing Club de Avellaneda', 't1071': 'Talleres de Córdoba',
    't1392': 'Gimnasia y Esgrima La Plata', 't2578': 'CA Huracán', 't8621': 'CA Aldosivi',
    't745': 'Rosario Central', 't6374': 'Unión de Santa Fe', 't4671': 'Atlético Tucuman',
    't10754': 'Gimnasia y Esgrima de Mendoza', 't2549': 'CA San Lorenzo',
    't10752': 'Central Córdoba', 't570': 'Vélez Sarsfield', 't8627': 'Independiente Rivadavia',
    't15362': 'Estudiantes de Río Cuarto', 't8629': 'CA Sarmiento', 't846': 'Argentinos Juniors',
    't2580': 'CA Tigre', 't927': 'Estudiantes', 't608': 'River Plate', 't540': 'Boca Juniors',
    't2451': 'CA Banfield',
}

WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']


def _norm(text):
    text = unicodedata.normalize('NFD', text.lower()).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', text)


def _slug(text):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFD', text.lower()).encode('ascii', 'ignore').decode())).strip('-')


def _read_csv(name):
    with open(os.path.join(DATA_DIR, name), encoding='utf-8') as f:
        return list(csv.DictReader(f))


def _fetch(url):
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def _load_feed(refresh):
    if refresh or not os.path.exists(RAW_FILE):
        print('Bajando el fixture de Opta...')
        text = _fetch(FEED_URL).decode('utf-8')
        os.makedirs(os.path.dirname(RAW_FILE), exist_ok=True)
        with open(RAW_FILE, 'w', encoding='utf-8') as f:
            f.write(text[text.index('(') + 1:text.rindex(')')])
    with open(RAW_FILE, encoding='utf-8') as f:
        return json.load(f)['SoccerFeed']['SoccerDocument']


def _categories():
    return {_norm(r['marca']): r['rubro'] for r in _read_csv('brand_categories.csv')}


def _industry(category):
    """Industry (rubro) para mostrar: las dos categorias de apuestas se juntan en una."""
    if category in BET_CATEGORIES:
        return 'Apuestas'
    return category or 'Sin clasificar'


def _sponsors_by_team():
    """Sponsors matcheados por equipo (todas las zonas de la camiseta), segun lo ya procesado."""
    categories = _categories()
    entity_types = {_norm(r['name']): r['tipo'] for r in _read_csv('entities.csv')}
    manual = {r['id']: r for r in _read_csv('manual_matches.csv')}
    found = defaultdict(lambda: defaultdict(set))
    for r in _read_csv('detections.csv'):
        if (r['country'], r['league'], r['season']) != (KITS_COUNTRY, KITS_LEAGUE, KITS_SEASON):
            continue
        match, kind = r['match'], r['match_type']
        edit = manual.get(r['id'])
        if edit and edit['action'] in ('ignore', 'unmatch'):
            match = ''
        elif edit and edit['action'] == 'match':
            match, kind = edit['match'], ''
        kind = entity_types.get(_norm(match), kind or 'sponsor') if match else ''
        if match and kind == 'sponsor':
            found[r['team']][match].add(r['region'])
    return {
        team: [
            {
                'name': name,
                'category': categories.get(_norm(name)),
                'isBet': categories.get(_norm(name)) in BET_CATEGORIES,
                'regions': sorted(regions),
            }
            # primero las casas de apuestas, despues el resto por nombre
            for name, regions in sorted(brands.items(), key=lambda x: (categories.get(_norm(x[0])) not in BET_CATEGORIES, x[0]))
        ]
        for team, brands in found.items()
    }


def _build_teams(feed):
    kits = {r['team']: r for r in _read_csv('kits.csv')
            if (r['country'], r['league'], r['season'], r['kit_type']) == (KITS_COUNTRY, KITS_LEAGUE, KITS_SEASON, 'local')}
    sponsors_by_team = _sponsors_by_team()
    categories = _categories()
    os.makedirs(os.path.join(STATIC, 'crests'), exist_ok=True)
    os.makedirs(os.path.join(STATIC, 'kits'), exist_ok=True)

    teams = {}
    for t in feed['Team']:
        opta_id = t['@attributes']['uID']
        kit = kits[OPTA_TO_KITS[opta_id]]
        slug = _slug(t['Name'])

        crest = os.path.join(STATIC, 'crests', f'{slug}.png')
        if not os.path.exists(crest):
            with open(crest, 'wb') as f:
                f.write(_fetch(CREST_URL.format(id=opta_id[1:])))
        shutil.copyfile(os.path.join(DATA_DIR, kit['path']), os.path.join(STATIC, 'kits', f'{slug}.jpg'))

        sponsors = list(sponsors_by_team.get(kit['team'], []))
        # El sponsor principal que figura en Football Kit Archive se suma si la deteccion no lo encontro
        main = kit['sponsor'] or None
        if main and _norm(main) not in {_norm(x['name']) for x in sponsors}:
            category = categories.get(_norm(main))
            sponsors.append({'name': main, 'category': category, 'isBet': category in BET_CATEGORIES, 'regions': ['pecho']})
        if not main:
            # sin dato en Football Kit Archive: el principal es el primero detectado en el pecho
            main = next((x['name'] for x in sponsors if 'pecho' in x['regions']), None)
        teams[opta_id] = {
            'id': opta_id,
            'slug': slug,
            'name': t['Name'],
            'officialName': t['OfficialTeamName'],
            'crest': f'crests/{slug}.png',
            'kit': f'kits/{slug}.jpg',
            'manufacturer': kit['brand'] or None,
            'sponsor': kit['sponsor'] or None,
            'mainSponsor': main,
            # todos los sponsors matcheados; las casas de apuestas llevan isBet = true
            'sponsors': sponsors,
            'betBrands': [x for x in sponsors if x['isBet']],
        }
    return teams


def _write_sponsors_csv(teams, path):
    """Un renglon por equipo y sponsor (los equipos sin sponsor van con la columna sponsor vacia)."""
    columns = ['team_id', 'team', 'sponsor', 'category', 'industry', 'region', 'is_main', 'is_bet']
    with open(path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for team in sorted(teams.values(), key=lambda t: t['name']):
            if not team['sponsors']:
                writer.writerow({'team_id': team['id'], 'team': team['name'], 'industry': NO_SPONSOR_INDUSTRY, 'is_main': 'false', 'is_bet': 'false'})
            for sponsor in team['sponsors']:
                writer.writerow({
                    'team_id': team['id'],
                    'team': team['name'],
                    'sponsor': sponsor['name'],
                    'category': sponsor['category'] or '',
                    'industry': _industry(sponsor['category']),
                    'region': ','.join(sponsor['regions']),
                    'is_main': str(sponsor['name'] == team['mainSponsor']).lower(),
                    'is_bet': str(sponsor['isBet']).lower(),
                })


def _build_industries(teams):
    """
    Industria del sponsor principal de cada club, lista para la rueda: cantidad de clubes por industria
    (de mayor a menor) y los grupos en el orden en que se dibujan: primero las casas de apuestas, despues las
    industrias con mas clubes y al final "Otros", que junta las de un solo club y a los clubes sin sponsor.
    """
    clubs = []
    for team in sorted(teams.values(), key=lambda t: _norm(t['name'])):
        main = next((s for s in team['sponsors'] if s['name'] == team['mainSponsor']), None)
        clubs.append({
            'team': {'id': team['id'], 'name': team['name'], 'crest': team['crest']},
            'sponsor': main['name'] if main else None,
            'industry': _industry(main['category']) if main else NO_SPONSOR_INDUSTRY,
            'isBet': bool(main and main['isBet']),
        })

    counts = {}
    for club in clubs:
        counts[club['industry']] = counts.get(club['industry'], 0) + 1
    ranking = sorted(counts.items(), key=lambda kv: (-kv[1], _norm(kv[0])))

    def label(club):
        return club['industry'] if club['industry'] == BET_INDUSTRY or counts[club['industry']] >= 2 else OTHERS_INDUSTRY

    groups = {}
    for club in clubs:
        groups.setdefault(label(club), []).append(club)

    def rank(name):
        if name == BET_INDUSTRY:
            return float('-inf')
        return float('inf') if name == OTHERS_INDUSTRY else -len(groups[name])

    return {
        'counts': [{'industry': name, 'clubs': n} for name, n in ranking],
        'groups': [
            {'label': name, 'isBet': name == BET_INDUSTRY, 'clubs': members}
            for name, members in sorted(groups.items(), key=lambda kv: rank(kv[0]))
        ],
    }


def _bet_impact(home, away):
    """0 = ninguno de los dos equipos tiene sponsor de apuestas, 0.5 = uno, 1 = los dos."""
    return (bool(home['betBrands']) + bool(away['betBrands'])) / 2


def _build_matches(feed, teams):
    matches = []
    for m in feed['MatchData']:
        info = m['MatchInfo']
        attrs = info['@attributes']
        if attrs['MatchType'] != 'Regular' or attrs['Period'] != 'FullTime':
            continue  # llaves de eliminacion directa (todavia sin jugar)
        sides = {d['@attributes']['Side']: d['@attributes'] for d in m['TeamData']}
        stats = {s['@attributes']['Type']: s['@value'] for s in m['Stat']}
        date, time = info['DateLocal']['@value'].split(' ')
        year, month, day = map(int, date.split('-'))
        weekday = WEEKDAYS[datetime.date(year, month, day).weekday()]

        home, away = teams[sides['Home']['TeamRef']], teams[sides['Away']['TeamRef']]
        home_goals, away_goals = int(sides['Home']['Score']), int(sides['Away']['Score'])
        matches.append({
            'id': m['@attributes']['uID'],
            'round': int(attrs['MatchDay']),
            'date': date,
            'weekday': weekday,
            'time': time[:5],
            'hour': round(int(time[:2]) + int(time[3:5]) / 60, 2),
            'venue': stats.get('Venue'),
            'city': stats.get('City'),
            'home': {'id': home['id'], 'name': home['name'], 'crest': home['crest'], 'goals': home_goals},
            'away': {'id': away['id'], 'name': away['name'], 'crest': away['crest'], 'goals': away_goals},
            'goals': home_goals + away_goals,
            # nivel de impacto de sponsors de casas de apuestas online del partido
            'betImpact': _bet_impact(home, away),
            # cantidad de marcas de casas de apuestas que se ven en las dos camisetas
            'betBrands': len(home['betBrands']) + len(away['betBrands']),
        })
    matches.sort(key=lambda x: (x['round'], x['date'], x['time'], x['id']))
    return matches


def main():
    feed = _load_feed('--refresh' in sys.argv)
    teams = _build_teams(feed)
    matches = _build_matches(feed, teams)

    out = os.path.join(STATIC, 'data')
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'teams.json'), 'w', encoding='utf-8') as f:
        json.dump(sorted(teams.values(), key=lambda t: t['name']), f, ensure_ascii=False, indent=1)
    with open(os.path.join(out, 'matches.json'), 'w', encoding='utf-8') as f:
        json.dump(matches, f, ensure_ascii=False, indent=1)

    _write_sponsors_csv(teams, os.path.join(out, 'sponsors.csv'))
    with open(os.path.join(out, 'industries.json'), 'w', encoding='utf-8') as f:
        json.dump(_build_industries(teams), f, ensure_ascii=False, indent=1)

    impacts = [m['betImpact'] for m in matches]
    print(f'{len(teams)} equipos, {len(matches)} partidos, {len({m["round"] for m in matches})} fechas')
    print('impacto 0 / 0.5 / 1:', [impacts.count(v) for v in (0, 0.5, 1)], 'promedio', round(sum(impacts) / len(impacts), 3))


if __name__ == '__main__':
    main()
