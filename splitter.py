import csv
from collections import defaultdict

res = defaultdict(list)
header = []
with open("static/footprintDeficitByYear/all_data.csv", "r") as data:
    x = csv.reader(data)
    for row, content in enumerate(x):
        if row == 0:
            header = content
        else:
            res[content[6]].append(content)

for year, v in res.items():
    with open("static/splitted_data/{}.csv".format(year), "w") as output:
        writer = csv.writer(output)
        writer.writerow(header)
        writer.writerows(v)
