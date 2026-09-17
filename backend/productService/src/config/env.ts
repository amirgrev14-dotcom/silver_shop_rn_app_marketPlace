// Единый источник секретов: сначала backend/.env (общее: JWT_SECRET,
// DATABASE_URL, FRONTEND_URL), потом свой .env (PORT и своё).
// loadEnvFile НЕ перезаписывает уже загруженное, поэтому общее побеждает,
// а локальный файл лишь добавляет недостающее.
//
// ВАЖНО: этот модуль должен импортироваться ПЕРВОЙ строкой в server.ts.
// Причина: в ESM все import'ы выполняются ДО кода файла. Если цепочка
// routes -> lib/prisma создаст PrismaClient раньше, чем env загружен,
// DATABASE_URL будет undefined и упадёт подключение к БД.
// Первый import = первый выполненный код.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

{
  const serviceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  for (const f of [path.join(serviceDir, "..", ".env"), path.join(serviceDir, ".env")]) {
    if (existsSync(f)) process.loadEnvFile(f);
  }
}
