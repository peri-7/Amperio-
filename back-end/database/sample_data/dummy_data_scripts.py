import json
import requests
import sys
from random import randint, uniform, choice
from datetime import datetime, timedelta
import calendar

num_records = int(sys.argv[1])

# ---------- Configuration ----------
endpoint = "http://localhost:9876/api/newsession"  # <-- replace with your API
headers = {
    "Content-Type": "application/json",
}

charger_ids = []
with open("charger.txt", "r") as f:
    for line in f:
        line = line.strip()
        if line:  # skip empty lines
            parts = line.split(",")
            if len(parts) > 1:
                charger_ids.append(parts[1])  # second column is the charger ID

print(f"Loaded {len(charger_ids)} charger IDs from charger.txt")

def generate_dummy_session(pointid):
    year = randint(2010, 2025)
    month = randint(1, 12)
    day = randint(1, calendar.monthrange(year, month)[1])  # safe day
    start_time = datetime(year, month, day, randint(0, 23), randint(0, 59))
    end_time = start_time + timedelta(hours=randint(0, 4), minutes=randint(0, 59))

    startsoc = randint(0, 100)
    endsoc = randint(startsoc, 100)
    totalkwh = round(uniform(5, 30), 2)
    kwhprice = round(uniform(0.3, 0.8), 2)
    amount = round(totalkwh * kwhprice, 2)

    return {
        "pointid": pointid,
        "starttime": start_time.strftime("%Y-%m-%d %H:%M"),
        "endtime": end_time.strftime("%Y-%m-%d %H:%M"),
        "startsoc": startsoc,
        "endsoc": endsoc,
        "totalkwh": totalkwh,
        "kwhprice": kwhprice,
        "amount": amount
    }

# ---------- Generate and POST ----------
success_count = 0
for i in range(num_records):
    charger_id = choice(charger_ids)  # pick a random charger ID
    record = generate_dummy_session(charger_id)
    print(record)
    try:
        response = requests.post(endpoint, headers=headers, json=record)
        if response.status_code in (200, 201):
            print(f"[✓] Record {i+1} posted successfully")
            success_count += 1
        else:
            print(f"[✗] Record {i+1} failed: {response.status_code} {response.text}")
    except Exception as e:
        print(f"[✗] Record {i+1} exception: {e}")

print(f"\nFinished posting {num_records} records. Success: {success_count}, Failed: {num_records - success_count}")

