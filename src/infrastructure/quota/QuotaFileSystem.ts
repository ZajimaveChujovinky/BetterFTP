import { FileSystem } from 'ftp-srv';
import { Transform } from 'stream';
import fs from 'fs';
import path from 'path';
import { ILogger } from '../../core/interfaces/Logger.interface.js';

/**
 * Recursively computes the total size (in bytes) of all files under a directory.
 */
async function getDirSize(dirPath: string): Promise<number> {
  let total = 0;
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += await getDirSize(fullPath);
    } else if (entry.isFile()) {
      try {
        const stat = await fs.promises.stat(fullPath);
        total += stat.size;
      } catch {
        // file may have disappeared; skip
      }
    }
  }
  return total;
}

/**
 * Returns a subclass of ftp-srv's FileSystem that enforces upload quotas.
 *
 * @param maxFileSize  Max bytes allowed for a single upload (undefined = no limit).
 * @param maxTotalSize Max bytes allowed as total home-directory usage (undefined = no limit).
 * @param logger       Optional logger instance.
 */
export function createQuotaFileSystemClass(
  maxFileSize: number | undefined,
  maxTotalSize: number | undefined,
  logger: ILogger,
) {
  // Only build the subclass when at least one limit is active.
  if (maxFileSize === undefined && maxTotalSize === undefined) {
    return FileSystem; // No quota → use stock FileSystem unchanged
  }

  return class QuotaFileSystem extends FileSystem {
    async write(
      fileName: string,
      { append = false, start }: { append?: boolean; start?: number } = {},
    ): Promise<{ stream: NodeJS.WritableStream; clientPath: string }> {
      // Pre-check total storage quota (async, before opening the file).
      if (maxTotalSize !== undefined) {
        const used = await getDirSize(this.root);
        if (used >= maxTotalSize) {
          logger.warn(`Total quota exceeded for user`, {
            root: this.root,
            used,
            maxTotalSize,
          });
          throw new Error(
            `Storage quota exceeded: directory is at ${used} / ${maxTotalSize} bytes.`,
          );
        }
      }

      // Delegate to parent to create the actual WriteStream.
      const { stream: writeStream, clientPath } = (super.write as Function)(fileName, {
        append,
        start,
      }) as { stream: fs.WriteStream; clientPath: string };

      // No per-file limit and no remaining-space tracking needed → return as-is.
      if (maxFileSize === undefined && maxTotalSize === undefined) {
        return { stream: writeStream, clientPath };
      }

      // Snapshot the current directory size so we can track remaining space.
      const usedAtStart = maxTotalSize !== undefined ? await getDirSize(this.root) : 0;
      const remainingSpace = maxTotalSize !== undefined ? maxTotalSize - usedAtStart : Infinity;

      let bytesWritten = 0;

      const quotaTransform = new Transform({
        transform(chunk: Buffer, _encoding, callback) {
          bytesWritten += chunk.length;

          if (maxFileSize !== undefined && bytesWritten > maxFileSize) {
            logger.warn(`Per-file quota exceeded`, { maxFileSize, bytesWritten });
            writeStream.destroy(
              new Error(`File too large: upload exceeds the ${maxFileSize}-byte file size limit.`),
            );
            callback(
              new Error(`File too large: upload exceeds the ${maxFileSize}-byte file size limit.`),
            );
            return;
          }

          if (isFinite(remainingSpace) && bytesWritten > remainingSpace) {
            logger.warn(`Total quota exceeded mid-upload`, {
              maxTotalSize,
              usedAtStart,
              bytesWritten,
            });
            writeStream.destroy(
              new Error(`Storage quota exceeded: not enough space remaining in your home directory.`),
            );
            callback(
              new Error(`Storage quota exceeded: not enough space remaining in your home directory.`),
            );
            return;
          }

          this.push(chunk);
          callback();
        },
        final(callback) {
          writeStream.end(callback);
        },
      });

      // Propagate stream errors both ways so resources are released cleanly.
      quotaTransform.on('error', () => writeStream.destroy());
      writeStream.on('error', () => quotaTransform.destroy());

      quotaTransform.pipe(writeStream);

      return { stream: quotaTransform, clientPath };
    }
  };
}
