export async function conTiempo<T>(promesa: Promise<T>, ms = 20000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([promesa, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('La conexión está tardando demasiado. Volvé a intentar.')), ms)
    })])
  } finally { if (timer) clearTimeout(timer) }
}
