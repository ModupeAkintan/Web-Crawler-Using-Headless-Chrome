import json
import pyasn

PYSAN_DB_FILEPATH = "/home/cs249i-student/project2/p2/pyasn/ipasn_db.dat"
INPUT_JSON_FILEPATH = "/home/cs249i-student/project2/p2/outputfile.jsonl"
AS_NAMES_FILEPATH = "/home/cs249i-student/output/as_names.txt"
OUTPUT_JSONL_FILEPATH = "/home/cs249i-student/project2/p2/output.jsonl"

asndb = pyasn.pyasn(PYSAN_DB_FILEPATH)

as_names_data = {}
with open(AS_NAMES_FILEPATH, 'r') as f:
    for line in f:
        as_info = json.loads(line)
        as_names_data[str(as_info['asn'])] = {
            'name': as_info['name'],
            'organization': as_info['organization']
        }

enriched_data = []
with open(INPUT_JSON_FILEPATH, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            resources = []
            for resource in data.get('resources', []):
                ip_address = resource.get('ip_address', 'UNKNOWN').split('/')[0]
                try:
                    asn = asndb.lookup(ip_address)[0]
                    asn_info = as_names_data.get(str(asn), {})
                    resource['asn'] = int(asn)
                    resource['asn_name'] = asn_info.get('name')
                except Exception as e:
                    print(f"Error processing IP {ip_address}: {e}")
                    resource['asn'] = None
                    resource['asn_name'] = None
                resources.append(resource)
            data['resources'] = resources
            enriched_data.append(data)
        except Exception as e:
            print(f"Error processing JSON line: {e}")

with open(OUTPUT_JSONL_FILEPATH, 'w') as f:
    for data in enriched_data:
        f.write(json.dumps(data) + '\n')

print("Enriched data written to", OUTPUT_JSONL_FILEPATH)
