def SMHash(key: str) -> int:
	hash = 0
	for i in key:
		hash = (hash << 6) + (hash << 16) - hash + ord(i)
	if hash == 0: hash = 1
	return hash % 0xFFFFFFFFFFFFF
