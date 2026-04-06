/*
  Warnings:

  - You are about to drop the column `studentId` on the `sessions` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[sessions] DROP CONSTRAINT [sessions_studentId_fkey];

-- AlterTable
ALTER TABLE [dbo].[sessions] DROP COLUMN [studentId];
ALTER TABLE [dbo].[sessions] ADD [topic] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[session_requests] (
    [id] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [mentorId] NVARCHAR(1000) NOT NULL,
    [sessionId] NVARCHAR(1000),
    [topic] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [session_requests_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [session_requests_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [session_requests_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_SessionAttendees] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [_SessionAttendees_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_SessionAttendees_B_index] ON [dbo].[_SessionAttendees]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[session_requests] ADD CONSTRAINT [session_requests_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[session_requests] ADD CONSTRAINT [session_requests_mentorId_fkey] FOREIGN KEY ([mentorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[session_requests] ADD CONSTRAINT [session_requests_sessionId_fkey] FOREIGN KEY ([sessionId]) REFERENCES [dbo].[sessions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[_SessionAttendees] ADD CONSTRAINT [_SessionAttendees_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[sessions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_SessionAttendees] ADD CONSTRAINT [_SessionAttendees_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
