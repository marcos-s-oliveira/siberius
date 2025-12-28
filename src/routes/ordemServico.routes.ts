import { Router, Request, Response } from 'express';
import { OrdemServicoController } from '../controllers/OrdemServicoController';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

router.get('/ordens-servico', OrdemServicoController.list);
router.get('/ordens-servico/numero/:numero', OrdemServicoController.getByNumero);

// Rota para servir PDF (deve vir antes de /:id)
router.get('/ordens-servico/:id/pdf', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[PDF] Requisição para OS ID: ${id}`);

    const os = await prisma.ordemServico.findUnique({
      where: { id },
    });

    if (!os) {
      console.log(`[PDF] OS não encontrada: ID ${id}`);
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const filePath = path.resolve(os.caminhoArquivo);
    console.log(`[PDF] Caminho do arquivo: ${filePath}`);
    console.log(`[PDF] Arquivo existe? ${fs.existsSync(filePath)}`);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`[PDF] Arquivo não encontrado: ${filePath}`);
      return res.status(404).json({ error: 'Arquivo PDF não encontrado no servidor' });
    }

    // Verificar se é um arquivo (não diretório)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.log(`[PDF] Caminho não é um arquivo: ${filePath}`);
      return res.status(404).json({ error: 'Caminho não aponta para um arquivo' });
    }

    console.log(`[PDF] Enviando arquivo: ${filePath} (${stats.size} bytes)`);

    // Definir headers para visualização inline
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(os.nomeArquivo)}"`);
    res.setHeader('Content-Length', stats.size);

    // Criar stream de leitura e enviar
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('[PDF] Erro no stream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao ler arquivo PDF' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('[PDF] Erro ao servir PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao carregar arquivo PDF' });
    }
  }
});

router.get('/ordens-servico/:id', OrdemServicoController.get);
router.post('/ordens-servico', OrdemServicoController.create);
router.put('/ordens-servico/:id', OrdemServicoController.update);
router.delete('/ordens-servico/:id', OrdemServicoController.delete);

export default router;
