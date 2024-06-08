import json
from datetime import date

with open("covid_death_case_vac.json") as f:
    data = json.load(f)
for d in data.copy():
    #Cleaning up the country name for turkey
    if d["code"] == "TUR":
        d["country"] = "Turkey"
    if d["code"] == "CHL":
        data.remove(d)
    #Constructing world data
    curr = {"country": "World", "code": "WORLD", "year": d["year"], "month": d["month"], "value": 0, "case": 0, "vaccination": 0, "population": 0}
    for dd in data:
        if dd["code"] == "WORLD" and dd["year"] == d["year"] and dd["month"] == d["month"]:
            break
    else:
        data.append(curr)
    curr["population"] += int(d["population"])
    curr["case"] += int(d["case"])
    curr["value"] += int(d["value"])
    curr["vaccination"] += int(d["vaccination"])
#sort the data by date and country name
sort_date = sorted(data, key=lambda d: date(d["year"], d["month"], 1))
sort_country = sorted(sort_date, key=lambda d: "AAA" if d["country"] == "World" else d["country"])

with open("covid_death_case_vac2.json", "w") as f:
    json.dump(sort_country, f, indent=1)