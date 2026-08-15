import requests
import json

SANITY_PROJECT_ID = 'y25q1ttr'
SANITY_DATASET = 'production'
url = f'https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/{SANITY_DATASET}?query=*[_type == "attractionsUser"]'
res = requests.get(url)

print("Status:", res.status_code)
data = res.json().get('result', [])
print(f"Total Users: {len(data)}\n")
for u in data:
    print(f"Name: {u.get('name')}")
    print(f"Email: {u.get('email')}")
    print(f"Company: {u.get('company')}")
    print(f"Approved: {u.get('isApproved')}")
    print(f"Role: {u.get('role', 'agent')}")
    print("-" * 40)
