-- AlterTable
ALTER TABLE `Document` MODIFY `kind` ENUM('text', 'code', 'image', 'sheet', 'quote', 'project', 'position', 'requirement', 'resume', 'service', 'matching', 'approval', 'contract', 'message', 'report', 'task', 'milestone', 'iteration', 'defect', 'risk', 'web', 'agent', 'admin', 'freelancer_registration', 'transaction') NULL DEFAULT 'quote';
