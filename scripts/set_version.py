#!/usr/bin/env python

import json
import math
import os

old_version = -1
old_version_string = ""
current_version = -1
current_version_string = ""

app_config_file = 'app.json'
with open(app_config_file, 'r') as f:
    data = json.load(f)
    old_version = data['expo']['android']['versionCode']
    major_version = str(math.floor(old_version / 1000))
    minor_version = str(math.floor((old_version % 1000) / 100))
    patch_version = str(math.floor(old_version % 100))
    old_version_string = major_version + "." + minor_version + "." + patch_version

current_version_string = input("Desired version (currently " + old_version_string + "): ")
number_array = current_version_string.split('.')
if len(number_array) != 3:
    print(" - Incorrect format")
    exit()
current_version = 1000 * int(number_array[0]) + 100 * int(number_array[1]) + int(number_array[2])

app_config_file = 'app.json'
with open(app_config_file, 'r') as f:
    data = json.load(f)
    data['expo']['android']['versionCode'] = current_version
    data['expo']['version'] = current_version_string
    data['expo']['ios']['buildNumber'] = current_version_string
    if number_array[1] != old_version_string.split('.')[1]:
        f = current_version_string.split('.')
        data['expo']['runtimeVersion'] = f[0] + "." + f[1]

os.remove(app_config_file)
with open(app_config_file, 'w') as f:
    json.dump(data, f, indent=4)

app_config_file = 'package.json'
with open(app_config_file, 'r') as f:
    data = json.load(f)
    data['version'] = current_version_string

os.remove(app_config_file)
with open(app_config_file, 'w') as f:
    json.dump(data, f, indent=4)

constants_file = 'src/config/constants.json'
with open(constants_file, 'r') as f:
    data = json.load(f)
    data['current_build'] = current_version
    version_number = data['current_build_string'] = current_version_string

os.remove(constants_file)
with open(constants_file, 'w') as f:
    json.dump(data, f, indent=4)

def replace_version(ov, ovs, cv, csv, fte):
    with open(fte, 'r') as file :
        filedata = file.read()

        # Replace the target string
        filedata = filedata.replace(str(ov), str(cv))
        filedata = filedata.replace(str(ovs), str(csv))

    # Write the file out again
    with open(fte, 'w') as file:
        file.write(filedata)
    
# Edit Android Gradle
replace_version(old_version, old_version_string, current_version, current_version_string, "android/app/build.gradle")

# Edit iOS Info.Plist
replace_version(old_version, old_version_string, current_version, current_version_string, "ios/ruleof3/Info.plist")