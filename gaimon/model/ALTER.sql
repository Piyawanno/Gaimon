ALTER TABLE gaimonuser ADD isdrop INTEGER DEFAULT 0;
create index gaimonuser_isdrop on gaimonuser(isdrop);

ALTER TABLE usergroup ADD isdrop INTEGER DEFAULT 0;
create index usergroup_isdrop on usergroup(isdrop);

ALTER TABLE stockitemtype ADD isdrop INTEGER DEFAULT 0;
create index stockitemtype_isdrop on stockitemtype(isdrop);

ALTER TABLE stockitemcategory ADD isdrop INTEGER DEFAULT 0;
create index stockitemcategory_isdrop on stockitemcategory(isdrop);

ALTER TABLE stockitemtype ADD pairedItemType INTEGER DEFAULT -1;
create index stockitemtype_pairedItemType on stockitemtype(pairedItemType);

ALTER TABLE dynamicmodel ADD parentname VARCHAR(255) DEFAULT '';
create index dynamicmodel_parentname on dynamicmodel(parentname);

ALTER TABLE dynamicmodel ADD hashed BIGINT DEFAULT -1;
ALTER TABLE dynamicform ADD converted jsonb;

ALTER TABLE gaimonuser ADD COLUMN isActive INTEGER DEFAULT 0;
create index gaimonuser_isActive on gaimonuser(isActive);

ALTER TABLE gaimonuser ADD COLUMN displayName VARCHAR(255) DEFAULT '';