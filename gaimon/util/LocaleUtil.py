from typing import List
import os, json, importlib

LOCALE = {}
EXTENSION_LOCALE = {}

THAI_DIGIT = [
	('0', '๐'),
	('1', '๑'),
	('2', '๒'),
	('3', '๓'),
	('4', '๔'),
	('5', '๕'),
	('6', '๖'),
	('7', '๗'),
	('8', '๘'),
	('9', '๙'),
]

def toThaiDigit(text: str):
	processed = text
	for k, v in THAI_DIGIT:
		processed = processed.replace(k, v)
	return processed

async def readLocale(language: str, extensionList:List = []):
	path = f'{importlib.import_module("gaimon").__path__[-1]}/locale/'
	global LOCALE
	if language in LOCALE: return LOCALE[language]
	for root, directories, files in os.walk(path):
		for i in files:
			with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
				content = fd.read()
				if not i.split('.')[0].split('-')[1] in LOCALE: LOCALE[i.split('.')[0].split('-')[1]] = {}
				LOCALE[i.split('.')[0].split('-')[1]] = json.loads(content)
	await readAllExtensionLocale(language, extensionList)
	if language in LOCALE:
		return LOCALE[language]
	else:
		return {}

async def readAllExtensionLocale(language: str, extensionList:List = []):
	locale = {}
	for key in extensionList :
		locale.update(await readExtensionLocale(language, key))
	return locale

async def readExtensionLocale(language, extension):
	global LOCALE, EXTENSION_LOCALE
	if not extension in EXTENSION_LOCALE: EXTENSION_LOCALE[extension] = {}
	if language in EXTENSION_LOCALE[extension]:
		return EXTENSION_LOCALE[extension][language]
	path = f'{importlib.import_module(extension).__path__[-1]}/locale/'
	if not os.path.isdir(path): return {}
	for root, directories, files in os.walk(path):
		for i in files:
			if i[-5:] != '.json': continue
			with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
				content = fd.read()
				EXTENSION_LOCALE[extension][i.split('.')[0].split('-')[1]] = json.loads(content)
				if not i.split('.')[0].split('-')[1] in LOCALE: LOCALE[i.split('.')[0].split('-')[1]] = {}
				LOCALE[i.split('.')[0].split('-')[1]].update(json.loads(content))
	if language in EXTENSION_LOCALE[extension]:
		return EXTENSION_LOCALE[extension][language]
	else:
		return {}