BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[mentor_applications] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [mentor_applications_status_df] DEFAULT 'PENDING',
    [reason] NVARCHAR(1000) NOT NULL,
    [resumeUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [mentor_applications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [mentor_applications_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [mentor_applications_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- AddForeignKey
ALTER TABLE [dbo].[mentor_applications] ADD CONSTRAINT [mentor_applications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
