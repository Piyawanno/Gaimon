from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.DateTimeColumn import DateTimeColumn
from xerial.Children import Children

class Task (Record):
    title = StringColumn()
    description = StringColumn()
    dueDate = DateTimeColumn()
    status = IntegerColumn()
    priority = IntegerColumn()
    project = IntegerColumn(foreignKey="Project.id")
    assignee = IntegerColumn(foreignKey="User.id")
    attachment = Children("Attachment.id")
    taskLabel = Children("TaskLabel.id")
