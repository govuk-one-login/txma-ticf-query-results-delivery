export const pause = async (delay: number) => {
  return new Promise((r) => setTimeout(r, delay))
}
