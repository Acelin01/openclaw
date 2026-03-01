-- Step 1: Update existing NULL values to default
UPDATE `Document` SET `kind` = 'quote' WHERE `kind` IS NULL;

-- Step 2: Modify the ENUM type
ALTER TABLE `Document` MODIFY `kind` ENUM('text','code','image','sheet','quote','project','position','requirement','resume','service','testcase') NULL DEFAULT 'quote';
