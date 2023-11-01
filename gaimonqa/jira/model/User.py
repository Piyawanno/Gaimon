from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.Children import Children

class User (Record):
    username = StringColumn()
    passwordHash = StringColumn()
    salt = StringColumn()
    Profile = Children("Profile.id")
    Project = Children("Project.id")
    Task = Children("Task.id")
