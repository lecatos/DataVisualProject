import json
import pandas as pd
from datetime import datetime
data = []
#['ï»¿"COUNTRY"', 'Country', 'WEEK', 'Week number', 'GENDER', 'Gender', 'AGE', 'Age', 'VARIABLE', 'Variable', 'YEAR', 'Year', 'Value', 'Flag Codes', 'Flags']
with open("HEALTH_MORTALITY.CSV") as f:
    a = pd.read_csv(f)
    for i, row in a.iterrows():
        if row.Variable == "COVID-19 deaths (number)":
            tmp = {"country": row.Country, "code": row['ï»¿"COUNTRY"'], "year": str(row.Year), "value": int(row.Value)}
            for d in data:
                if d["country"] == tmp["country"] and d["year"] == tmp["year"]:
                    d["value"] += tmp["value"]
                    break
            else:
                data.append(tmp)

with open("covid_death.json", "w") as f:
    f.write(json.dumps(data, indent=1))


def zeroIfNan(num):
    return 0 if num != num else num
data = []
with open("HEALTH_MORTALITY.CSV") as f:
    a = pd.read_csv(f)
    for i, row in a.iterrows():
        if row.Variable == "COVID-19 deaths (number)":
            date = datetime.strptime(f"{row.Year} {row.WEEK} 1", "%Y %W %w")
            tmp = {"country": row.Country, "code": row['ï»¿"COUNTRY"'], "year": date.year, "month": date.month, "value": int(row.Value), "case": 0, "vaccination": 0, "population": 0}
            for d in data:
                if d["country"] == tmp["country"] and d["year"] == tmp["year"] and d["month"] == tmp["month"]:
                    d["value"] += tmp["value"]
                    break
            else:
                data.append(tmp)
with open("owid-covid-data.csv") as f:
    a = pd.read_csv(f)
    print(a)
    for i, row in a.iterrows():
        print(i) if i % 1000 == 0 else None
        date = datetime.strptime(row.date, "%Y-%m-%d")
        for d in data:
            if d["code"] == row.iso_code and date.month == d["month"] and date.year == d["year"]:
                d["case"] += zeroIfNan(row.new_cases)
                d["vaccination"] += zeroIfNan(row.new_vaccinations)
                d["population"] += zeroIfNan(row.population)
with open("covid_death_case_vac.json", "w") as f:
    f.write(json.dumps(data, indent=1))