-- CreateTable
CREATE TABLE "task_templates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_templates_creatorId_idx" ON "task_templates"("creatorId");

-- CreateIndex
CREATE INDEX "task_templates_isGlobal_idx" ON "task_templates"("isGlobal");

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
