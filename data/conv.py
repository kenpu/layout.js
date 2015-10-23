import json
import sys

data = []
with open(sys.argv[1], "r") as f:
    for line in f.readlines():
        (x1, x2, sim) = line.strip().split()
        sim = float(sim)
        data.append([x1, x2, sim])

print json.dumps(data, indent=True)
