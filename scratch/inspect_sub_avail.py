import requests
import json
import hashlib

BASE = 'http://129.159.237.41/cebu'
API_KEY = '235ed5f665a076097bd33bbce86f29ee'
SECRET = '2d0558cbac58473551110d5539c31aab'

r1 = requests.post(f'{BASE}/reseller_auth/session', headers={'X-API-Version': 'v1.10', 'Content-Type': 'application/x-www-form-urlencoded'}, data={'apikey': API_KEY})
s_key = r1.json()['response']['data']['session_key']

auth_key = hashlib.md5((s_key + SECRET).encode()).hexdigest()
r2 = requests.post(f'{BASE}/reseller_auth/token', headers={'X-API-Version': 'v1.10', 'Content-Type': 'application/x-www-form-urlencoded'}, data={'session_key': s_key, 'auth_key': auth_key})
token = r2.json()['response']['data']['auth_token']

r_sub = requests.get(f'{BASE}/ticket/availabilities?time_from=2026-08-21&time_to=2026-08-21&sku_id=USSPDFADSUPERP', headers={'Authorization': f'BEARER {token}', 'X-API-Version': 'v1.10'})
print("USSPDFADSUPERP availabilities:", json.dumps(r_sub.json(), indent=2))
