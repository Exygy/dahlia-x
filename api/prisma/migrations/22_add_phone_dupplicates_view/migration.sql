DROP VIEW "application_flagged_set_possibilities";

CREATE VIEW "application_flagged_set_possibilities" AS (
    SELECT
        CONCAT(
            LOWER(a.first_name),
            '-',
            LOWER(a.last_name),
            '-',
            a.birth_month,
            '-',
            a.birth_day,
            '-',
            a.birth_year
        ) as "key",
        app.listing_id,
        app.id as "application_id",
        'nameAndDOB' as "type"
    FROM
        applicant a,
        applications app
    WHERE
        a.id = app.applicant_id
        and app.deleted_at is null
)
UNION
(
    SELECT
        a.email_address as "key",
        app.listing_id,
        app.id as "application_id",
        'email' as "type"
    FROM
        applications app,
        applicant a
    WHERE
        a.id = app.applicant_id
        and a.email_address is not null
        and app.deleted_at is null
)
UNION
(
    SELECT
        CONCAT(
            LOWER(hm.first_name),
            '-',
            LOWER(hm.last_name),
            '-',
            hm.birth_month,
            '-',
            hm.birth_day,
            '-',
            hm.birth_year
        ) as "key",
        app.listing_id,
        app.id as "application_id",
        'nameAndDOB' as "type"
    FROM
        applications app,
        household_member hm
    WHERE
        hm.application_id = app.id
        and app.deleted_at is null
)
UNION
(
    SELECT
        a.phone_number as "key",
        app.listing_id,
        app.id as "application_id",
        'phoneNumber' as "type"
    FROM
        applications app,
        applicant a
    WHERE
        a.id = app.applicant_id
        and a.no_phone = false
        and a.phone_number is not null
        and not a.phone_number = ''
        and app.deleted_at is null
);

-- AlterEnum
ALTER TYPE "rule_enum" ADD VALUE 'phoneNumber';
