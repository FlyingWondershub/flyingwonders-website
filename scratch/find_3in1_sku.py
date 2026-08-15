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

r3 = requests.get(f'{BASE}/attractions', headers={'Authorization': f'BEARER {token}', 'X-API-Version': 'v1.10'})
attractions = r3.json().get('response', {}).get('data', [])

print("Listing all items containing '3IN1' or 'Universal':")
for item in attractions:
    if '3in1' in item.get('title', '').lower() or 'universal' in item.get('title', '').lower():
        print(f"SKU: {item.get('sku_id')} | Title: {item.get('title')} | ProductType: {item.get('product_type')}")
