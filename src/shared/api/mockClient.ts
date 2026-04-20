export const delay = (min = 300, max = 800): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))

export const maybeError = (rate = 0.05): void => {
  if (Math.random() < rate) {
    throw new Error('Network error — please retry')
  }
}
