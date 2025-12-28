/*
  Warnings:

  - A unique constraint covering the columns `[numeroOS,versao]` on the table `ordens_servico` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ordens_servico_numeroOS_key";

-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN     "ativa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "osOriginalId" INTEGER,
ADD COLUMN     "versao" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "ordens_servico_numeroOS_ativa_idx" ON "ordens_servico"("numeroOS", "ativa");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_numeroOS_versao_key" ON "ordens_servico"("numeroOS", "versao");

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_osOriginalId_fkey" FOREIGN KEY ("osOriginalId") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
