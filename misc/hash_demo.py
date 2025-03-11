import hashlib
import json


def hash_json_object(json_obj):
    # Serialize the JSON object with sorted keys
    canonical_json = json.dumps(json_obj, sort_keys=True)
    # Hash the canonical string using SHA-256
    hash_object = hashlib.sha256(canonical_json.encode())
    return hash_object.hexdigest()


# Example usage
json_obj = {"name": "Alice", "age": 30, "city": "New York"}
json_obj2 = {"city": "New York", "name": "Alice", "age": 30}  # Different order

hash1 = hash_json_object(json_obj)
hash2 = hash_json_object(json_obj2)

print("Hash 1:", hash1)
print("Hash 2:", hash2)
