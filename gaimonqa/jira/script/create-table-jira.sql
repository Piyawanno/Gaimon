CREATE TABLE "User" (
    userID INT PRIMARY KEY,
    username VARCHAR(255),
    passwordHash VARCHAR(64),
    salt VARCHAR(255)
);

CREATE TABLE "Profile" (
    profileID INT PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    userID INT UNIQUE,
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE "Project" (
    projectID INT PRIMARY KEY,
    projectName VARCHAR(255),
    userID INT,
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE "Task" (
    taskID INT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    dueDate DATE,
    status INT,
    priority INT,
    assignee INT,
    projectID INT,
    FOREIGN KEY (assignee) REFERENCES "User"(userID),
    FOREIGN KEY (projectID) REFERENCES "Project"(projectID)
);

CREATE TABLE "Label" (
    labelID INT PRIMARY KEY,
    labelName VARCHAR(255)
);

CREATE TABLE "TaskLabel" (
    taskLabelID INT PRIMARY KEY,
    taskID INT,
    labelID INT,
    FOREIGN KEY (taskID) REFERENCES "Task"(taskID),
    FOREIGN KEY (labelID) REFERENCES "Label"(labelID)
);

CREATE TABLE "Attachment" (
    attachmentID INT PRIMARY KEY,
    fileName VARCHAR(255),
    taskID INT,
    FOREIGN KEY (taskID) REFERENCES "Task"(taskID)
);
