import json
from datetime import date

with open("covid_death_case_vac2.json") as f:
    data = json.load(f)

output = []
for d in data:
    for dd in output:
        if d["code"] in dd:
            break
    else:
        output.append({"country": d["country"], "code": d["code"], "fatality_rate": 0.0, "total_death": 0, "total_case": 0})
    for dd in output:
        if dd["code"] == d["code"]:
            dd["total_death"] += d["value"]
            dd["total_case"] += d["case"]
            break


to_remove = []
for d in output:
    tdeath = d["total_death"]
    tcase = d["total_case"]
    if tdeath != 0 and tcase != 0:
        rate = round(tdeath/tcase, 4)
        d["fatality_rate"] = rate
        if rate == 0:
            to_remove.append(d)
    else:
        to_remove.append(d)
for r in to_remove:
    output.remove(r)

with open("covid_fatality_rate.json", "w") as f:
    json.dump(output, f, indent = 1)
