import json
from xerial.PostgresDBSession import PostgresDBSession
from Dog import Dog

with open("/etc/xerial/Xerial.json") as fd:
    config = json.load(fd)
    session = PostgresDBSession(config)
    session.connect()
    session.appendModel(Dog)
    session.createTable()

    # Modify the Dog model
    dogInstance = Dog()
    dogInstance.modify()

    # Check the modification
    dogMods = dogInstance.__class__.__modification__
    modificationList = [
        {"versions": mod.version.__str__(), "modifications": mod.column}
        for mod in dogMods
    ]
    print(modificationList)

    # Perform the modification
    session.checkModelModification(Dog, "2")

    # Insert
    randomDog = Dog()
    randomDog.name = "Tiger2"
    randomDog.age = 5
    randomDog.weight = 20.0
    randomDog.height = 10.0

    session.insert(randomDog)

    # loop through the list of dogList
    dogList = session.select(Dog, "", isRelated=False)
    for dog in dogList:
        print(
            getattr(dog, "id", ""),
            getattr(dog, "name", ""),
            getattr(dog, "age", ""),
            getattr(dog, "weight", ""),
            getattr(dog, "height", ""),
        )
