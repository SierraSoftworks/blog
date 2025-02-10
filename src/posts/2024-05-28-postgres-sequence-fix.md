---
title: Fixing PostgreSQL Sequence Numbers
description: |
    If you've found yourself in a situation where your PostgreSQL database
    sequence numbers are out of sync with the data in your tables, you'll likely
    want to get to fixing that - let me show you how.

date: 2024-05-28 12:00:00
permalinkPattern: :year/:month/:day/:slug/
categories:
    - operations
    - databases
tags:
    - postgresql
    - sre

# cspell:ignore setval, nextval, plpgsql
---

# Fixing PostgreSQL Sequence Numbers
If you've found yourself in a situation where your PostgreSQL database
sequence numbers are out of sync with the data in your tables, you'll likely
want to get to fixing that.

This script is intended to automatically fix the sequence numbers for all tables in the current database.

<!-- more -->

This is accomplished through the use of the `setval()` command, which we provide with the next ID value we wish to make use of.
We use the [`setval(sequence, number, is_called)`](https://www.postgresql.org/docs/8.2/static/functions-sequence.html) overload
and set `is_called = false` in conjunction with `COALESCE(MAX + 1, 1)` to ensure that, with an empty table, the next sequence
value is `1` as expected.

<!-- markdownlint-disable line-length -->
```sql
-- This function is responsible for fixing the id sequences for all tables in
-- a database. It is useful when you have used pg_dump to restore data from another
-- database.
--
-- This function has been written such that it is easy to see what it does (i.e.
-- lots of variables etc.) however it can be rewritten to execute in a single line
-- should you prefer a bit of extra performance and don't mind not knowing which
-- sequences were updated.

CREATE OR REPLACE FUNCTION fix_sequence(tableName text, columnName text)
RETURNS BOOLEAN AS $$
DECLARE
    nextValue int;
    expectedNextValue int;
    sequenceName text;
BEGIN
    EXECUTE 'SELECT pg_get_serial_sequence(''' || tableName || ''', ''' || columnName || ''')' INTO sequenceName;
    SELECT nextval(sequenceName) INTO nextValue;
    EXECUTE 'SELECT COALESCE(MAX(' || columnName || ') + 1, 1) FROM ' || tableName INTO expectedNextValue;

    IF nextValue < expectedNextValue THEN
        EXECUTE 'SELECT setval(''' || sequenceName || ''', ' || expectedNextValue || ', false)';
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- Here's a faster (but harder to understand) single line version which you can use instead, if you wish.

-- CREATE OR REPLACE FUNCTION fix_sequence(tableName text, columnName text)
-- RETURNS void AS $$
-- DECLARE
-- BEGIN
--     EXECUTE 'SELECT setval(pg_get_serial_sequence(''' || tableName || ''', ''' || columnName || '''), (SELECT COALESCE (MAX(' || columnName || ') + 1, 1) FROM ' || tableName || '), false)';
-- END;
-- $$ LANGUAGE plpgsql VOLATILE;

-- Execute the fix
SELECT
    table_name || '_' || column_name || '_seq' AS Sequence,
    fix_sequence(table_name, column_name) AS ResetResult
FROM information_schema.columns
WHERE column_default LIKE 'nextval%';

-- Cleanup the function
DROP FUNCTION fix_sequence(text, text);
```
<!-- markdownlint-enable line-length -->