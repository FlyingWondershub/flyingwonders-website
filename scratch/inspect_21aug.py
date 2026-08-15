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

# Check ticket/availabilities for RWSUSS on 2026-08-21
r_avail = requests.get(f'{BASE}/ticket/availabilities?time_from=2026-08-21&time_to=2026-08-21&sku_id=RWSUSS', headers={'Authorization': f'BEARER {token}', 'X-API-Version': 'v1.10'})
print("=== /ticket/availabilities for RWSUSS on 2026-08-21 ===")
print(json.dumps(r_avail.json(), indent=2))

# Also check attraction/details for RWSUSS
r_det = requests.get(f'{BASE}/attraction/details?sku_id=RWSUSS', headers={'Authorization': f'BEARER {token}', 'X-API-Version': 'v1.10'})
tickets = r_det.json().get('response', {}).get('data', {}).get('tickets', [])
print("\n=== All Sub-Tickets under RWSUSS in /attraction/details ===")
for t in tickets:
    print(f"SKU: {t.get('sku_id')} | Title: {t.get('type')} | RetailPrice: {t.get('retail_price')}")
    dates = t.get('available_dates', [])
    aug21 = [d for d in dates if d.get('date') == '2026-08-21']
    print(f"  -> 2026-08-21 Availability in details: {aug21}")
