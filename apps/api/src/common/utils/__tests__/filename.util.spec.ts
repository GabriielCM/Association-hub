import { describe, it, expect } from 'vitest';

import { sanitizeFilename, getFileExtension } from '../filename.util';

describe('sanitizeFilename', () => {
  describe('path traversal prevention', () => {
    it('deve remover sequências de path traversal básicas (..)', () => {
      const result = sanitizeFilename('../../../etc/passwd');
      expect(result).toBe('etc-passwd');
      expect(result).not.toContain('..');
    });

    it('deve remover sequências complexas de path traversal', () => {
      const result = sanitizeFilename('image.png/../../../config.json');
      expect(result).toBe('image.png-config.json');
      expect(result).not.toContain('..');
    });

    it('deve remover path traversal com barra invertida (Windows)', () => {
      const result = sanitizeFilename('..\\..\\..\\windows\\system32');
      expect(result).toBe('windows-system32');
      expect(result).not.toContain('\\');
    });

    it('deve remover path traversal misto (/ e \\)', () => {
      const result = sanitizeFilename('../..\\../file.txt');
      expect(result).toBe('file.txt');
      expect(result).not.toContain('..');
    });

    it('deve lidar com múltiplos pontos consecutivos', () => {
      const result = sanitizeFilename('....//....\\\\file.png');
      expect(result).toBe('file.png');
    });
  });

  describe('separadores de caminho', () => {
    it('deve substituir barras normais por hífen', () => {
      const result = sanitizeFilename('path/to/file.txt');
      expect(result).toBe('path-to-file.txt');
      expect(result).not.toContain('/');
    });

    it('deve substituir barras invertidas por hífen', () => {
      const result = sanitizeFilename('path\\to\\file.txt');
      expect(result).toBe('path-to-file.txt');
      expect(result).not.toContain('\\');
    });

    it('deve substituir separadores mistos por hífen', () => {
      const result = sanitizeFilename('path/to\\mixed/file.txt');
      expect(result).toBe('path-to-mixed-file.txt');
    });
  });

  describe('caracteres de controle e null bytes', () => {
    it('deve remover null bytes (\\x00)', () => {
      const result = sanitizeFilename('file\x00.txt');
      expect(result).toBe('file.txt');
      expect(result).not.toContain('\x00');
    });

    it('deve remover caracteres de controle ASCII (0-31)', () => {
      const result = sanitizeFilename('file\x01\x02\x1f.txt');
      expect(result).toBe('file.txt');
    });

    it('deve remover caractere DEL (\\x7f)', () => {
      const result = sanitizeFilename('file\x7f.txt');
      expect(result).toBe('file.txt');
    });

    it('deve remover múltiplos caracteres de controle', () => {
      const result = sanitizeFilename('fi\x00le\x01na\x1fme.txt');
      expect(result).toBe('filename.txt');
    });
  });

  describe('normalização unicode', () => {
    it('deve normalizar caracteres unicode (NFD)', () => {
      const result = sanitizeFilename('café.txt');
      // NFD normalization converts é to e + combining accent
      expect(result).toMatch(/caf.*\.txt/);
    });

    it('deve lidar com caracteres unicode full-width', () => {
      const result = sanitizeFilename('ｆｉｌｅ.txt');
      // Full-width characters should be normalized or removed
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('caracteres perigosos', () => {
    it('deve remover caracteres especiais perigosos', () => {
      const result = sanitizeFilename('file<>:"|?*.txt');
      expect(result).toBe('file-.txt');
      expect(result).not.toMatch(/[<>:"|?*]/);
    });

    it('deve substituir espaços por hífen', () => {
      const result = sanitizeFilename('my file name.txt');
      expect(result).toBe('my-file-name.txt');
      expect(result).not.toContain(' ');
    });

    it('deve substituir parênteses por hífen', () => {
      const result = sanitizeFilename('my file (1).jpg');
      expect(result).toBe('my-file-1-.jpg');
    });

    it('deve manter apenas caracteres seguros (a-zA-Z0-9._-)', () => {
      const result = sanitizeFilename('safe_File-123.TXT');
      expect(result).toBe('safe_File-123.TXT');
    });
  });

  describe('pontos e hífens iniciais/finais', () => {
    it('deve remover pontos iniciais', () => {
      const result = sanitizeFilename('...file.txt');
      expect(result).toBe('file.txt');
      expect(result).not.toMatch(/^\./);
    });

    it('deve remover pontos finais', () => {
      const result = sanitizeFilename('file...');
      expect(result).toBe('file');
      expect(result).not.toMatch(/\.$/);
    });

    it('deve remover hífens iniciais', () => {
      const result = sanitizeFilename('---file.txt');
      expect(result).toBe('file.txt');
      expect(result).not.toMatch(/^-/);
    });

    it('deve remover hífens finais', () => {
      const result = sanitizeFilename('file.txt---');
      expect(result).toBe('file.txt');
      expect(result).not.toMatch(/-$/);
    });

    it('deve remover pontos e hífens mistos iniciais/finais', () => {
      const result = sanitizeFilename('.-.-file.txt-.-.');
      expect(result).toBe('file.txt');
    });
  });

  describe('colapso de caracteres repetidos', () => {
    it('deve colapsar múltiplos pontos em um só', () => {
      const result = sanitizeFilename('file...txt');
      expect(result).toBe('file.txt');
      expect(result).not.toMatch(/\.{2,}/);
    });

    it('deve colapsar múltiplos hífens em um só', () => {
      const result = sanitizeFilename('my---file.txt');
      expect(result).toBe('my-file.txt');
      expect(result).not.toMatch(/-{2,}/);
    });

    it('deve colapsar múltiplos underscores em um só', () => {
      const result = sanitizeFilename('my___file.txt');
      expect(result).toBe('my_file.txt');
      expect(result).not.toMatch(/_{2,}/);
    });
  });

  describe('comprimento do nome de arquivo', () => {
    it('deve truncar nomes muito longos preservando extensão', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);

      expect(result.length).toBeLessThanOrEqual(255);
      expect(result).toMatch(/\.txt$/);
    });

    it('deve preservar extensão ao truncar', () => {
      const longName = 'b'.repeat(250) + '.jpeg';
      const result = sanitizeFilename(longName);

      expect(result).toMatch(/\.jpeg$/);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('deve lidar com nomes curtos normalmente', () => {
      const result = sanitizeFilename('short.txt');
      expect(result).toBe('short.txt');
    });
  });

  describe('casos extremos', () => {
    it('deve retornar "file" para string vazia', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('file');
    });

    it('deve retornar "file" para apenas pontos', () => {
      const result = sanitizeFilename('....');
      expect(result).toBe('file');
    });

    it('deve retornar "file" para apenas barras', () => {
      const result = sanitizeFilename('////');
      expect(result).toBe('file');
    });

    it('deve retornar "file" para apenas path traversal', () => {
      const result = sanitizeFilename('../../..');
      expect(result).toBe('file');
    });

    it('deve retornar "file" para null', () => {
      const result = sanitizeFilename(null as any);
      expect(result).toBe('file');
    });

    it('deve retornar "file" para undefined', () => {
      const result = sanitizeFilename(undefined as any);
      expect(result).toBe('file');
    });

    it('deve retornar "file" para número', () => {
      const result = sanitizeFilename(123 as any);
      expect(result).toBe('file');
    });

    it('deve retornar "file" para objeto', () => {
      const result = sanitizeFilename({} as any);
      expect(result).toBe('file');
    });
  });

  describe('preservação de extensões', () => {
    it('deve preservar extensão simples', () => {
      const result = sanitizeFilename('document.pdf');
      expect(result).toBe('document.pdf');
    });

    it('deve preservar extensão múltipla (última parte)', () => {
      const result = sanitizeFilename('archive.tar.gz');
      expect(result).toBe('archive.tar.gz');
    });

    it('deve lidar com arquivo sem extensão', () => {
      const result = sanitizeFilename('README');
      expect(result).toBe('README');
    });

    it('deve lidar com múltiplos pontos no nome', () => {
      const result = sanitizeFilename('my.file.name.txt');
      expect(result).toBe('my.file.name.txt');
    });
  });

  describe('casos reais de ataque', () => {
    it('deve bloquear tentativa de acesso a /etc/passwd', () => {
      const result = sanitizeFilename('../../../etc/passwd');
      expect(result).not.toContain('/etc/');
      expect(result).not.toContain('..');
      expect(result).toBe('etc-passwd');
    });

    it('deve bloquear tentativa de sobrescrever config.json', () => {
      const result = sanitizeFilename('innocent.png/../../../config.json');
      expect(result).not.toContain('/config');
      expect(result).not.toContain('..');
      expect(result).toBe('innocent.png-config.json');
    });

    it('deve bloquear tentativa Windows system32', () => {
      const result = sanitizeFilename('..\\..\\..\\windows\\system32\\config');
      expect(result).not.toContain('\\');
      expect(result).not.toContain('..');
      expect(result).toBe('windows-system32-config');
    });

    it('deve bloquear tentativa de acessar .env', () => {
      const result = sanitizeFilename('image.png/../../.env');
      expect(result).not.toContain('/.env');
      expect(result).not.toContain('..');
      expect(result).toBe('image.png-.env');
    });

    it('deve bloquear null byte injection', () => {
      const result = sanitizeFilename('safe.txt\x00.jpg');
      expect(result).not.toContain('\x00');
      expect(result).toBe('safe.txt.jpg');
    });
  });
});

describe('getFileExtension', () => {
  describe('extensões válidas', () => {
    it('deve extrair extensão simples', () => {
      const result = getFileExtension('image.png');
      expect(result).toBe('.png');
    });

    it('deve extrair extensão de múltiplas partes (última parte)', () => {
      const result = getFileExtension('document.tar.gz');
      expect(result).toBe('.gz');
    });

    it('deve incluir o ponto na extensão', () => {
      const result = getFileExtension('file.txt');
      expect(result).toMatch(/^\./);
      expect(result).toBe('.txt');
    });

    it('deve extrair extensão com letras maiúsculas', () => {
      const result = getFileExtension('IMAGE.PNG');
      expect(result).toBe('.PNG');
    });
  });

  describe('casos sem extensão', () => {
    it('deve retornar string vazia para arquivo sem extensão', () => {
      const result = getFileExtension('README');
      expect(result).toBe('');
    });

    it('deve retornar string vazia para arquivo oculto Unix (ponto inicial)', () => {
      const result = getFileExtension('.gitignore');
      expect(result).toBe('');
    });

    it('deve retornar string vazia para string vazia', () => {
      const result = getFileExtension('');
      expect(result).toBe('');
    });
  });

  describe('validação de segurança', () => {
    it('deve retornar string vazia se extensão contém barra normal', () => {
      const result = getFileExtension('file.png/path');
      expect(result).toBe('');
    });

    it('deve retornar string vazia se extensão contém barra invertida', () => {
      const result = getFileExtension('file.png\\path');
      expect(result).toBe('');
    });

    it('deve lidar com path traversal na extensão', () => {
      const result = getFileExtension('file.png/../etc');
      expect(result).toBe('');
    });
  });

  describe('entradas inválidas', () => {
    it('deve retornar string vazia para null', () => {
      const result = getFileExtension(null as any);
      expect(result).toBe('');
    });

    it('deve retornar string vazia para undefined', () => {
      const result = getFileExtension(undefined as any);
      expect(result).toBe('');
    });

    it('deve retornar string vazia para número', () => {
      const result = getFileExtension(123 as any);
      expect(result).toBe('');
    });

    it('deve retornar string vazia para objeto', () => {
      const result = getFileExtension({} as any);
      expect(result).toBe('');
    });
  });

  describe('múltiplos pontos', () => {
    it('deve retornar apenas a última extensão', () => {
      const result = getFileExtension('my.file.name.txt');
      expect(result).toBe('.txt');
    });

    it('deve lidar corretamente com vários pontos', () => {
      const result = getFileExtension('archive.tar.gz.backup');
      expect(result).toBe('.backup');
    });
  });
});
